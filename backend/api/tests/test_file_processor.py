import io

from django.test import TestCase

from api.services.file_processor import extract_text, get_file_type


class TestGetFileType(TestCase):
    """Tests unitaires pour get_file_type."""

    def test_txt_extension(self):
        self.assertEqual(get_file_type("data.txt"), "txt")

    def test_text_extension(self):
        self.assertEqual(get_file_type("data.text"), "txt")

    def test_md_extension(self):
        self.assertEqual(get_file_type("readme.md"), "txt")

    def test_pdf_extension(self):
        self.assertEqual(get_file_type("doc.pdf"), "pdf")

    def test_docx_extension(self):
        self.assertEqual(get_file_type("doc.docx"), "docx")

    def test_doc_extension(self):
        self.assertEqual(get_file_type("doc.doc"), "docx")

    def test_csv_extension(self):
        self.assertEqual(get_file_type("data.csv"), "csv")

    def test_uppercase_extension(self):
        self.assertEqual(get_file_type("data.TXT"), "txt")

    def test_unsupported_extension(self):
        with self.assertRaises(ValueError):
            get_file_type("data.xyz")

    def test_no_extension(self):
        with self.assertRaises(ValueError):
            get_file_type("noextension")


class TestExtractText(TestCase):
    """Tests unitaires pour extract_text."""

    def test_extract_txt(self):
        content = "Bonjour le monde"
        file_obj = io.BytesIO(content.encode("utf-8"))
        result = extract_text(file_obj, "txt")
        self.assertEqual(result, content)

    def test_extract_txt_unicode(self):
        content = "Les caractères spéciaux : é, è, ê, ë, à"
        file_obj = io.BytesIO(content.encode("utf-8"))
        result = extract_text(file_obj, "txt")
        self.assertEqual(result, content)

    def test_extract_csv(self):
        content = "col1,col2\nval1,val2\nval3,val4"
        file_obj = io.BytesIO(content.encode("utf-8"))
        result = extract_text(file_obj, "csv")
        self.assertIn("col1", result)
        self.assertIn("val1", result)
        self.assertIn("val3", result)

    def test_unsupported_format(self):
        file_obj = io.BytesIO(b"data")
        with self.assertRaises(ValueError):
            extract_text(file_obj, "xyz")
