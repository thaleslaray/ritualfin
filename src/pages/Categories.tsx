import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { CategoryList } from '@/components/categories/CategoryList';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useReorderCategories,
  useUpdateCategory,
} from '@/hooks/useCategories';

const Categories = () => {
  const navigate = useNavigate();

  const { data: categories, isLoading, error } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const reorder = useReorderCategories();

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-display text-foreground">Categorias</h1>
            <p className="text-caption text-muted-foreground">
              Renomeie, desative ou reordene. A referência do histórico é a key.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-body font-medium">Adicionar categoria</p>
            <CategoryForm
              isLoading={createCategory.isPending}
              onCreate={(displayName) => createCategory.mutate({ displayName })}
            />
          </CardContent>
        </Card>

        {error ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-body text-destructive">Erro ao carregar categorias: {error.message}</p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-body text-muted-foreground">Carregando…</p>
            </CardContent>
          </Card>
        ) : (categories?.length ?? 0) === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-body font-medium">Nenhuma categoria ainda</p>
              <p className="text-caption text-muted-foreground mt-1">
                Crie a primeira categoria acima. Ela vai aparecer aqui e também no popup de categorização.
              </p>
            </CardContent>
          </Card>
        ) : (
          <CategoryList
            categories={categories ?? []}
            onRename={(id, displayName) => updateCategory.mutate({ id, displayName })}
            onToggleActive={(id, isActive) => updateCategory.mutate({ id, isActive })}
            onDelete={(id) => deleteCategory.mutate({ id })}
            onReorder={(orderedIds) => reorder.mutate({ orderedIds })}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Categories;
