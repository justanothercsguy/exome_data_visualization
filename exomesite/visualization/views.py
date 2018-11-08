from django.http import HttpResponse

from .models import Gene

def index(request):
    sample_gene_list = Gene.objects.order_by('-id')[:10]
    # remove gene objects that have duplicate name2 strings
    output = ', '.join(list(set([g.name2 for g in sample_gene_list]))) 
    return HttpResponse(output)

def query(request, id):
    return HttpResponse("You're querying the gene %s." % id)
