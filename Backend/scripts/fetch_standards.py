import os
from pathlib import Path
from internetarchive import search_items, download

DEST_DIR = Path(__file__).resolve().parent.parent / "data" / "bis_standards"
DEST_DIR.mkdir(parents=True, exist_ok=True)

# Your exact target ingestion list
target_standards = [
    "IS 616", "IS 302", "IS 16102", "IS 16046",       # Electronics & IT
    "IS 2501", "IS 13334", "IS 14543",                # Food & Agriculture
    "IS 3854",                                        # Electrical
    "IS 9873",                                        # Toys
    "IS 269", "IS 8112", "IS 12269",                  # Cement
    "IS 1786", "IS 2062",                             # Steel
    "IS 17243", "IS 17264",                           # Textiles
    "IS 15495", "IS 16047",                           # Packaging
    "IS 13450",                                       # Medical Devices
    "IS 1417", "IS 1418"                              # Jewelry
]

print("[*] Initiating Autonomous PDF Retrieval...")

for standard in target_standards:
    # Query the specific open-source public safety collection
    query = f'title:("{standard}") AND collection:(publicsafetycode)'
    results = list(search_items(query))
    
    if results:
        # Grab the highest-ranking match
        identifier = results[0]['identifier']
        print(f" [+] Found {standard} -> Downloading {identifier}.pdf")
        try:
            download(
                identifier, 
                destdir=str(DEST_DIR), 
                glob_pattern='*.pdf', 
                no_directory=True
            )
        except Exception as e:
            print(f" [!] Error downloading {standard}: {e}")
    else:
        print(f" [-] {standard} not found in archive. Skipping.")

print("[*] Procurement complete. Ready for Docling extraction.")