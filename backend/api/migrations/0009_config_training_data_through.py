"""Replace simple M2M with through model ConfigTrainingData.

Django cannot alter M2M fields to add through=, so we:
1. Copy existing links into the new through table
2. Remove the old auto-managed M2M table
3. (The model now declares through='ConfigTrainingData')
"""

import django.db.models.deletion
from django.db import migrations, models


def copy_m2m_to_through(apps, schema_editor):
    """Copy existing M2M rows into the new through table."""
    ConfigTrainingData = apps.get_model("api", "ConfigTrainingData")
    db_alias = schema_editor.connection.alias

    # Read existing links from the auto-managed M2M table
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("SELECT modelconfig_id, trainingdata_id FROM api_modelconfig_training_data")
        rows = cursor.fetchall()

    for config_id, data_id in rows:
        ConfigTrainingData.objects.using(db_alias).get_or_create(
            config_id=config_id,
            training_data_id=data_id,
            defaults={"is_active": True},
        )


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0008_add_config_user_to_chatmessage"),
    ]

    operations = [
        # 1. Create through table
        migrations.CreateModel(
            name="ConfigTrainingData",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("is_active", models.BooleanField(default=True)),
                (
                    "config",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="api.modelconfig",
                    ),
                ),
                (
                    "training_data",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="api.trainingdata",
                    ),
                ),
            ],
            options={
                "unique_together": {("config", "training_data")},
            },
        ),
        # 2. Copy data from auto-managed M2M table to through table
        migrations.RunPython(copy_m2m_to_through, migrations.RunPython.noop),
        # 3. Remove old auto-managed M2M field
        migrations.RemoveField(
            model_name="modelconfig",
            name="training_data",
        ),
        # 4. Add new M2M field with through
        migrations.AddField(
            model_name="modelconfig",
            name="training_data",
            field=models.ManyToManyField(
                blank=True,
                related_name="configs",
                through="api.ConfigTrainingData",
                to="api.trainingdata",
            ),
        ),
    ]
