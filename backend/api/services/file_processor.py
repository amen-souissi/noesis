import csv
import io


def extract_text(file_obj, file_type: str) -> str:
    """Extrait le texte brut d'un fichier uploadé.

    Formats supportés : txt, pdf, docx, csv.
    """
    if file_type == "txt":
        return file_obj.read().decode("utf-8")

    elif file_type == "pdf":
        import PyPDF2

        reader = PyPDF2.PdfReader(file_obj)
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)

    elif file_type == "docx":
        import docx

        doc = docx.Document(file_obj)
        return "\n".join(para.text for para in doc.paragraphs)

    elif file_type == "csv":
        content = file_obj.read().decode("utf-8")
        reader = csv.reader(io.StringIO(content))
        return "\n".join(" ".join(row) for row in reader)

    else:
        raise ValueError(f"Format non supporté : {file_type}")


def get_file_type(filename: str) -> str:
    """Détermine le type de fichier à partir de l'extension."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext in ("txt", "text", "md"):
        return "txt"
    if ext == "pdf":
        return "pdf"
    if ext in ("docx", "doc"):
        return "docx"
    if ext == "csv":
        return "csv"
    raise ValueError(f"Extension non supportée : .{ext}")
