from django.http import HttpResponse
from django.template import loader 

from .models import Gene


def index(request):
    sample_gene_list = list(set(Gene.objects.order_by('-name2')[:10]))
    template = loader.get_template('visualization/index.html')
    context = {
        'sample_gene_list': sample_gene_list,
    }
    return HttpResponse(template.render(context, request))

def query(request, id):
    return HttpResponse("You're querying the gene %s." % id)
