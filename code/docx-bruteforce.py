import msoffcrypto
import io
import time
import os
from multiprocessing import Pool, cpu_count, Manager
import keyboard
import threading
from tkinter import Tk
from tkinter.filedialog import askopenfilename

def is_valid(code: int) -> bool:
    digits = list(str(code))
    return all(digits.count(d) < 3 for d in set(digits))

candidates = [code for code in range(1000, 10000) if is_valid(code)]

_shared_data = None
_file_data = None
_output_path = None

def init_pool(shared_data, file_data, output_path):
    global _shared_data, _file_data, _output_path
    _shared_data = shared_data
    _file_data = file_data
    _output_path = output_path

def worker(pwd: int):
    shared = _shared_data
    if shared['found']:
        return None
    shared['attempts'] += 1
    password = str(pwd)
    office_file = msoffcrypto.OfficeFile(io.BytesIO(_file_data))
    try:
        office_file.load_key(password=password)
        decrypted = io.BytesIO()
        office_file.decrypt(decrypted)
        with open(_output_path, "wb") as out_file:
            out_file.write(decrypted.getbuffer())
        shared['found'] = True
        return password
    except Exception:
        return None

def monitor(shared_data, total, stop_event):
    try:
        while not stop_event.is_set():
            if keyboard.is_pressed("r"):
                tried = shared_data.get('attempts', 0)
                print(f"[{tried}/{total}] passwords tried...", flush=True)
                time.sleep(0.5)
    except Exception:
        pass

if __name__ == "__main__":
    Tk().withdraw()
    protected_file_path = askopenfilename(
        title="Select the password-protected .docx file",
        filetypes=[("Word Documents", "*.docx")]
    )

    if not protected_file_path:
        print("No file selected.")
        exit(1)

    with open(protected_file_path, "rb") as f:
        file_data = f.read()

    filename = os.path.splitext(os.path.basename(protected_file_path))[0]
    output_path = os.path.join(os.path.dirname(protected_file_path), f"{filename}_decrypted.docx")

    start = time.time()
    total = len(candidates)
    print(f"Starting brute-force: {total} candidates.")

    with Manager() as manager:
        shared_data = manager.dict(found=False, attempts=0)
        stop_event = threading.Event()
        mon = threading.Thread(
            target=monitor,
            args=(shared_data, total, stop_event),
            daemon=True
        )
        mon.start()

        with Pool(
            processes=cpu_count(),
            initializer=init_pool,
            initargs=(shared_data, file_data, output_path)
        ) as pool:
            for result in pool.imap_unordered(worker, candidates):
                if result:
                    print(f"\nPassword found: {result}")
                    stop_event.set()
                    break
            else:
                stop_event.set()

    duration = time.time() - start
    print(f"\nDone. Elapsed time: {duration:.2f} sec.")
