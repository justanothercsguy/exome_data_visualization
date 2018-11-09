from django.core.serializers import serialize
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from django.http import Http404
from django.shortcuts import render


from .models import Gene, Variant


def index(request):
    query_gene_list = Gene.objects.order_by('-name2')[:10]
    gene_name_set = set()
    new_gene_list = []

    # check for gene objects that have the same value in the 'name2' field 
    # exclude those in the new_gene_list
    for gene in query_gene_list:
        if gene.name2 not in gene_name_set:
            new_gene_list.append(gene)
            gene_name_set.add(gene.name2)

    context = {'sample_gene_list': new_gene_list}
    return render(request, 'visualization/index.html', context)

def result(request, gene_name2):
    gene = []
    variant_list = []

    try:
        # if there are variants of the same gene, get the one with the most exons
        gene = Gene.objects.filter(name2=gene_name2).order_by('-exoncount')[0]
    except Gene.DoesNotExist:
        raise Http404("Could not find gene " + str(gene_name2))

    try:
        variant_list = Variant.objects.filter(name=gene_name2)
    except Variant.DoesNotExist:
        raise Http404("Could not find variants for gene " + str(gene_name2))

    # json serialize the QuerySet of Variant objects
    return render(request, 'visualization/result.html', {
        'gene': gene,
        'variant_list_json': serialize('json', variant_list, cls=DjangoJSONEncoder)
    })
