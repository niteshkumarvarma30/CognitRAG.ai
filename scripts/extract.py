import PyPDF2
import os

def slice_aws_pdf(input_path, output_path, start_page, end_page):
    """
    Slices the massive AWS API Gateway PDF into a 40-page test chunk.
    """
    if not os.path.exists(input_path):
        print(f"Error: Could not find '{input_path}' in the current folder.")
        print("Please ensure the AWS PDF is in the same folder as this script and named correctly.")
        return

    try:
        print(f"Opening {input_path}...")
        with open(input_path, 'rb') as infile:
            reader = PyPDF2.PdfReader(infile)
            writer = PyPDF2.PdfWriter()

            total_pages = len(reader.pages)
            print(f"Original document length: {total_pages} pages.")
            
            # Ensure we don't try to extract pages that don't exist
            actual_end_page = min(end_page, total_pages)

            # PyPDF2 uses 0-based indexing (Page 1 is index 0)
            for i in range(start_page - 1, actual_end_page):
                writer.add_page(reader.pages[i])

            # Save the new miniature PDF
            with open(output_path, 'wb') as outfile:
                writer.write(outfile)
                
            print(f"✅ Success! Extracted pages {start_page} to {actual_end_page}.")
            print(f"📁 Saved as: {output_path}")

    except Exception as e:
        print(f"❌ Error slicing PDF: {e}")

# --- Configuration ---
# Update this to match the EXACT name of the AWS PDF you downloaded
INPUT_FILE = "aws-api-gateway-developer-guide.pdf" 
OUTPUT_FILE = "tenant_c_aws_sample.pdf"

# Extracting a 40-page technical chunk focusing on Auth/Integrations
slice_aws_pdf(INPUT_FILE, OUTPUT_FILE, start_page=450, end_page=490)