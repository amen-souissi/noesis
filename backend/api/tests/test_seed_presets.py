from django.core.management import call_command
from django.test import TestCase

from api.models import ConfigTrainingData, ModelConfig, TrainingData


class TestSeedPresets(TestCase):
    """Tests pour la commande seed_presets."""

    def test_seed_creates_presets(self):
        self.assertEqual(ModelConfig.objects.count(), 0)
        call_command("seed_presets")
        presets = ModelConfig.objects.filter(is_preset=True)
        self.assertEqual(presets.count(), 2)

    def test_seed_idempotent(self):
        """Lancer deux fois ne crée pas de doublons."""
        call_command("seed_presets")
        call_command("seed_presets")
        self.assertEqual(ModelConfig.objects.filter(is_preset=True).count(), 2)
        self.assertEqual(TrainingData.objects.filter(name__startswith="Données ").count(), 2)

    def test_preset_names(self):
        call_command("seed_presets")
        names = set(ModelConfig.objects.filter(is_preset=True).values_list("name", flat=True))
        self.assertIn("Calculatrice", names)
        self.assertIn("Le chat", names)

    def test_presets_are_valid(self):
        """Tous les presets passent la validation."""
        call_command("seed_presets")
        for config in ModelConfig.objects.filter(is_preset=True):
            errors = config.validate_config()
            self.assertEqual(errors, [], f"Preset '{config.name}' invalide : {errors}")

    def test_calculatrice_config(self):
        """Calculatrice utilise la config Small."""
        call_command("seed_presets")
        calc = ModelConfig.objects.get(name="Calculatrice")
        self.assertEqual(calc.d_model, 64)
        self.assertEqual(calc.n_heads, 4)
        self.assertEqual(calc.n_layers, 2)

    def test_le_chat_config(self):
        """Le chat utilise une config adaptée au corpus."""
        call_command("seed_presets")
        chat = ModelConfig.objects.get(name="Le chat")
        self.assertEqual(chat.d_model, 64)
        self.assertEqual(chat.n_heads, 4)
        self.assertEqual(chat.n_layers, 2)

    def test_training_data_created(self):
        """Les fichiers de données sont créés avec le bon contenu."""
        call_command("seed_presets")
        calc_data = TrainingData.objects.filter(name="Données Calculatrice")
        self.assertTrue(calc_data.exists())
        self.assertIn("1+2=3", calc_data.first().extracted_text)
        self.assertNotIn("2+1=3", calc_data.first().extracted_text)

        chat_data = TrainingData.objects.filter(name="Données Le chat")
        self.assertTrue(chat_data.exists())
        self.assertIn("Le chat", chat_data.first().extracted_text)

    def test_training_data_created_with_content(self):
        """Les données des presets ont du contenu non vide."""
        call_command("seed_presets")
        for data in TrainingData.objects.filter(name__startswith="Données "):
            self.assertGreater(data.char_count, 0)
            self.assertGreater(len(data.extracted_text), 0)

    def test_removes_old_presets(self):
        """Les anciens presets sont supprimés."""
        ModelConfig.objects.create(name="Old Preset", is_preset=True)
        call_command("seed_presets")
        self.assertFalse(ModelConfig.objects.filter(name="Old Preset").exists())
        self.assertEqual(ModelConfig.objects.filter(is_preset=True).count(), 2)

    # ── Tests ConfigTrainingData links ───────────────────

    def test_presets_have_data_links(self):
        """Chaque preset a un lien ConfigTrainingData vers ses données."""
        call_command("seed_presets")
        for config in ModelConfig.objects.filter(is_preset=True):
            links = ConfigTrainingData.objects.filter(config=config)
            self.assertEqual(links.count(), 1, f"Preset '{config.name}' doit avoir 1 lien")

    def test_preset_links_active_by_default(self):
        """Les liens ConfigTrainingData des presets sont is_active=True."""
        call_command("seed_presets")
        for link in ConfigTrainingData.objects.all():
            self.assertTrue(
                link.is_active,
                f"Lien {link.config.name} → {link.training_data.name} devrait être actif",
            )

    def test_preset_links_correct_data(self):
        """Chaque preset est lié à ses propres données."""
        call_command("seed_presets")
        calc = ModelConfig.objects.get(name="Calculatrice")
        chat = ModelConfig.objects.get(name="Le chat")

        calc_link = ConfigTrainingData.objects.get(config=calc)
        self.assertEqual(calc_link.training_data.name, "Données Calculatrice")

        chat_link = ConfigTrainingData.objects.get(config=chat)
        self.assertEqual(chat_link.training_data.name, "Données Le chat")

    def test_seed_idempotent_links(self):
        """Lancer seed deux fois ne duplique pas les liens."""
        call_command("seed_presets")
        call_command("seed_presets")
        self.assertEqual(ConfigTrainingData.objects.count(), 2)
