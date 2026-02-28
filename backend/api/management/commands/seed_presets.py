import os

from django.core.management.base import BaseCommand

from api.models import ConfigTrainingData, ModelConfig, TrainingData

PRESETS = [
    {
        "name": "Calculatrice",
        "description": (
            "Apprend l'addition en base 10 (X+Y). "
            "2+1 est exclu des données pour tester la commutativité."
        ),
        "d_model": 64,
        "n_heads": 4,
        "n_layers": 2,
        "d_ff": 256,
        "seq_len": 64,
        "batch_size": 16,
        "learning_rate": 1e-3,
        "max_epochs": 100,
        "data_file": "calculatrice.txt",
    },
    {
        "name": "Le chat",
        "description": (
            "Apprend des phrases en français sur les animaux et la nature. "
            "Configuration adaptée au corpus (~50K paramètres)."
        ),
        "d_model": 64,
        "n_heads": 4,
        "n_layers": 2,
        "d_ff": 256,
        "seq_len": 128,
        "batch_size": 16,
        "learning_rate": 1e-3,
        "max_epochs": 100,
        "weight_decay": 0.01,
        "data_file": "le_chat.txt",
    },
]


class Command(BaseCommand):
    help = "Crée les instances prédéfinies (Calculatrice + Le chat) avec leurs données"

    def handle(self, *args, **options):
        # Remove old presets that are no longer in the list
        preset_names = {p["name"] for p in PRESETS}
        old_presets = ModelConfig.objects.filter(is_preset=True).exclude(name__in=preset_names)
        deleted_count = old_presets.count()
        old_presets.delete()
        if deleted_count:
            self.stdout.write(f"  {deleted_count} ancien(s) preset(s) supprimé(s)")

        configs_created = 0
        data_created = 0

        for preset in PRESETS:
            name = preset["name"]
            description = preset["description"]
            data_file = preset["data_file"]

            # Create ModelConfig
            config_fields = {
                k: v for k, v in preset.items() if k not in ("name", "description", "data_file")
            }
            config_obj, was_created = ModelConfig.objects.get_or_create(
                name=name,
                defaults={
                    "description": description,
                    "is_preset": True,
                    **config_fields,
                },
            )
            if was_created:
                configs_created += 1
            else:
                # Update existing preset config fields
                updated = False
                for field, value in config_fields.items():
                    if getattr(config_obj, field, None) != value:
                        setattr(config_obj, field, value)
                        updated = True
                if config_obj.description != description:
                    config_obj.description = description
                    updated = True
                if updated:
                    config_obj.save()

            # Create or update TrainingData from file in data/
            data_name = f"Données {name}"
            data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data")
            file_path = os.path.join(data_dir, data_file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()
            except FileNotFoundError:
                self.stdout.write(
                    self.style.WARNING(f"  Fichier {data_file} introuvable — données non créées")
                )
                continue

            data_obj = TrainingData.objects.filter(name=data_name).first()
            if not data_obj:
                data_obj = TrainingData.objects.create(
                    name=data_name,
                    original_filename=data_file,
                    file_type="txt",
                    file_size=len(text.encode("utf-8")),
                    extracted_text=text,
                    char_count=len(text),
                )
                data_created += 1
            elif data_obj.char_count != len(text):
                # Update existing data if file content changed
                data_obj.extracted_text = text
                data_obj.file_size = len(text.encode("utf-8"))
                data_obj.char_count = len(text)
                data_obj.save(update_fields=["extracted_text", "file_size", "char_count"])

            # Link training data to config via through model (active by default)
            if data_obj:
                link, link_created = ConfigTrainingData.objects.get_or_create(
                    config=config_obj,
                    training_data=data_obj,
                    defaults={"is_active": True},
                )
                # Activate existing links that were previously inactive
                if not link_created and not link.is_active:
                    link.is_active = True
                    link.save(update_fields=["is_active"])

        self.stdout.write(
            self.style.SUCCESS(
                f"{configs_created} preset(s) créé(s), "
                f"{data_created} fichier(s) de données créé(s) "
                f"({len(PRESETS)} total)"
            )
        )
