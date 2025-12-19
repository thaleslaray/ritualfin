import { useEffect, useMemo, useRef, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, Pencil, Save, Trash2 } from 'lucide-react';

import type { Category } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function CategoryList({
  categories,
  onRename,
  onToggleActive,
  onDelete,
  onReorder,
}: {
  categories: Category[];
  onRename: (id: string, displayName: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}) {
  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const sortedIds = useMemo(() => {
    return [...categories]
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return a.display_name.localeCompare(b.display_name);
      })
      .map((c) => c.id);
  }, [categories]);

  const [ids, setIds] = useState<string[]>(sortedIds);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const latestIdsRef = useRef<string[]>(sortedIds);

  useEffect(() => {
    setIds(sortedIds);
  }, [sortedIds]);

  useEffect(() => {
    latestIdsRef.current = ids;
  }, [ids]);

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditingValue(c.display_name);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const next = editingValue.trim();
    if (next.length >= 2) onRename(editingId, next);
    setEditingId(null);
    setEditingValue('');
  };

  const Row = ({ id }: { id: string }) => {
    const c = byId.get(id);
    const controls = useDragControls();

    if (!c) return null;

    const isEditing = editingId === c.id;

    return (
      <Reorder.Item
        key={c.id}
        value={c.id}
        dragListener={false}
        dragControls={controls}
        onDragEnd={() => onReorder(latestIdsRef.current)}
        className="p-4 flex items-center gap-3 bg-background"
      >
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-muted-foreground"
          onPointerDown={(e) => controls.start(e)}
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Input
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="h-8"
                autoFocus
              />
            ) : (
              <p className="text-body font-medium truncate">{c.display_name}</p>
            )}

            <Badge variant={c.is_active ? 'default' : 'secondary'}>
              {c.is_active ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
          <p className="text-footnote text-muted-foreground truncate">key: {c.key}</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-caption text-muted-foreground select-none">
            <Checkbox
              checked={c.is_active}
              onCheckedChange={(checked) => onToggleActive(c.id, checked === true)}
            />
            Ativa
          </label>

          {isEditing ? (
            <Button size="icon" variant="ghost" onClick={saveEdit}>
              <Save className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="icon" variant="ghost" onClick={() => startEdit(c)}>
              <Pencil className="w-4 h-4" />
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você só consegue excluir se ela não estiver em uso. Se estiver em uso,
                  desative ao invés de excluir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(c.id)}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Reorder.Item>
    );
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Reorder.Group
          axis="y"
          values={ids}
          onReorder={(next) => setIds(next)}
          className="divide-y"
        >
          {ids.map((id) => (
            <Row key={id} id={id} />
          ))}
        </Reorder.Group>
      </CardContent>
    </Card>
  );
}
