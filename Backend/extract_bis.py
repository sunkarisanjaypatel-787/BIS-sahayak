import json
from pathlib import Path
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.datamodel.base_models import InputFormat

# Hardcoded mapping for your specific ingestion targets
CATEGORY_MAP = {
    "IS_616": "Electronics & IT", "IS_302": "Electronics & IT", 
    "IS_16102": "Electronics & IT", "IS_16046": "Electronics & IT",
    "IS_2501": "Food & Agriculture", "IS_13334": "Food & Agriculture", "IS_14543": "Food & Agriculture",
    "IS_3854": "Electrical Appliances",
    "IS_9873": "Toys",
    "IS_269": "Cement", "IS_8112": "Cement", "IS_12269": "Cement",
    "IS_1786": "Steel", "IS_2062": "Steel",
    "IS_17243": "Textiles", "IS_17264": "Textiles",
    "IS_15495": "Packaging", "IS_16047": "Packaging",
    "IS_13450": "Medical Devices",
    "IS_1417": "Jewelry/Hallmarking", "IS_1418": "Jewelry/Hallmarking"
}

def determine_category(filename: str) -> str:
    for is_code, category in CATEGORY_MAP.items():
        if is_code in filename.upper():
            return category
    return "Uncategorized Standard"

def build_extraction_pipeline():
    # Force high-fidelity table structure recognition
    pipeline_options = PdfPipelineOptions()
    pipeline_options.do_table_structure = True
    pipeline_options.do_ocr = True 

    converter = DocumentConverter(
        allowed_formats=[InputFormat.PDF],
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
        }
    )

    pdf_directory = Path("./Backend")
    pdf_directory.mkdir(exist_ok=True)
    output_file = Path("Backend/parsed_bis_knowledge.json")
    
    extracted_nodes = []

    print("[*] Initiating Docling Extraction Sequence...")
    
    for pdf_path in pdf_directory.glob("*.pdf"):
        print(f"    -> Parsing {pdf_path.name}")
        category = determine_category(pdf_path.name)
        
        # Execute parsing
        result = converter.convert(pdf_path)
        
        # Exporting to Markdown preserves table structures perfectly for Ollama
        markdown_content = result.document.export_to_markdown()
        
        extracted_nodes.append({
            "source_file": pdf_path.name,
            "category": category,
            "raw_markdown": markdown_content
        })

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(extracted_nodes, f, indent=4)
        
    print(f"[*] Extraction complete. {len(extracted_nodes)} standards compiled to {output_file.name}")

if __name__ == "__main__":
    build_extraction_pipeline()
