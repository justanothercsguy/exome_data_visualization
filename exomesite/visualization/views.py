from django.core.serializers import serialize
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render
from django.urls import reverse

from .models import Gene, Variant


# return up to the first 10 uniquely named genes from the database
def get_ten_genes():
    query_gene_list = Gene.objects.order_by('-name2')[:10]
    gene_name_set = set()
    new_gene_list = []

    # check for gene objects that have the same value in the 'name2' field 
    # exclude those in the new_gene_list
    for gene in query_gene_list:
        if gene.name2 not in gene_name_set:
            new_gene_list.append(gene)
            gene_name_set.add(gene.name2)

    return new_gene_list


# send data to homepage of the visualization app
def index(request):
    return render(request, 'visualization/index.html', {
        'sample_gene_list': get_ten_genes
    })


# send the data from querying a gene to the corresponding html page, 
# or redirect to homepage with an error message saying the gene was not found
def result(request, gene_name2):
    gene = []
    variant_list = []

    try:
        # if there are variants of the same gene, get the one with the most exons
        gene = Gene.objects.filter(name2=gene_name2).order_by('-exoncount')[0]
    except:
        error_message = "Could not find gene " + str(gene_name2)
        return render(request, 'visualization/index.html', {
            'sample_gene_list': get_ten_genes(),
            'error_message': error_message
        })

    # TODO: figure out how to handle exception case where the gene exists 
    # in visualization_gene table but the variants for that gene do not exist 
    # in the visualization_variants table
    try:
        variant_list = Variant.objects.filter(name=gene_name2)
    except Variant.DoesNotExist:
        raise Http404("Could not find variants for gene " + str(gene_name2))

    # json serialize the QuerySet of Variant objects
    return render(request, 'visualization/result.html', {
        'gene': gene,
        'variant_list_json': serialize('json', variant_list, cls=DjangoJSONEncoder)
    })


# get the name of the gene that the user inputted in the searchbox 
# and redirect to the result view with that input
def search(request):
    gene_name = request.POST.get("query_gene", "")

    # Catch exceptional case where there is no input in the searchbox
    if not gene_name:
        error_message = "Please enter a gene name"
        return render(request, 'visualization/index.html', {
            'sample_gene_list': get_ten_genes(),
            'error_message': error_message
        })

    return HttpResponseRedirect(reverse('visualization:result', args=(gene_name,)))
    