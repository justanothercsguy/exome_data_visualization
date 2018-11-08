from django.db import models

class Gene(models.Model):
    name = models.CharField(max_length=200)
    chrom = models.CharField(max_length=200)
    strand = models.CharField(max_length=200)
    txstart = models.BigIntegerField()  # Field name made lowercase.
    txend = models.BigIntegerField()  # Field name made lowercase.
    cdsstart = models.BigIntegerField()  # Field name made lowercase.
    cdsend = models.BigIntegerField()  # Field name made lowercase.
    exoncount = models.IntegerField()  # Field name made lowercase.
    exonstarts = models.TextField()  # Field name made lowercase.
    exonends = models.TextField()  # Field name made lowercase.
    score = models.IntegerField() # value is always 0
    name2 = models.CharField(max_length=200)
    cdsstartstat = models.CharField(max_length=200)  # Field name made lowercase.
    cdsendstat = models.CharField(max_length=200)  # Field name made lowercase.
    exonframes = models.TextField()  # Field name made lowercase.

    # some genes have variants so use both names for distinguishing variants
    def __str__(self):
        return self.name2 + ' (' + self.name + ')'
