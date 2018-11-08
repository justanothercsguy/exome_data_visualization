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

class Variants(models.Model):
    chrom = models.CharField(max_length=200)
    position = models.IntegerField()
    rsid = models.CharField(max_length=200)
    reference = models.CharField(max_length=200)
    alternate = models.CharField(max_length=200)
    consequence = models.CharField(max_length=200)
    proteinconsequence = models.CharField(max_length=200)
    transcriptconsequence = models.CharField(max_length=200)
    filter = models.CharField(max_length=200)
    annotation = models.CharField(max_length=200)
    flags = models.CharField(max_length=200)
    allelecount = models.IntegerField()
    allelenumber = models.BigIntegerField()
    numberofhomozygotes = models.IntegerField()
    allelefrequency = models.FloatField()
    allelecountafrican = models.IntegerField()
    allelenumberafrican = models.IntegerField()
    homozygotecountafrican = models.IntegerField()
    allelecounteastasian = models.IntegerField()
    allelenumbereastasian = models.IntegerField()
    homozygotecounteastasian = models.IntegerField()
    allelecounteuropean_non_finnish_field = models.IntegerField()
    allelenumbereuropean_non_finnish_field = models.IntegerField()
    homozygotecounteuropean_non_finnish_field = models.IntegerField()
    allelecountfinnish = models.IntegerField()
    allelenumberfinnish = models.IntegerField()
    homozygotecountfinnish = models.IntegerField()
    allelecountlatino = models.IntegerField()
    allelenumberlatino = models.IntegerField()
    homozygotecountlatino = models.IntegerField()
    allelecountother = models.IntegerField()
    allelenumberother = models.IntegerField()
    homozygotecountother = models.IntegerField()
    allelecountsouthasian = models.IntegerField()
    allelenumbersouthasian = models.IntegerField()
    homozygotecountsouthasian = models.IntegerField()

    def __str__(self):
        return ("chrom; " + self.chrom + ", position: " + self.position +
            ", reference/alternate: " + self.reference + '/' + self.alternate)