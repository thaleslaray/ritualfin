import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const schema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Digite pelo menos 2 caracteres')
    .max(30, 'Máximo de 30 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export function CategoryForm({
  onCreate,
  isLoading,
}: {
  onCreate: (displayName: string) => void;
  isLoading?: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '' },
  });

  const onSubmit = (values: FormValues) => {
    onCreate(values.displayName);
    form.reset({ displayName: '' });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="Nova categoria (ex.: Pets)"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          Adicionar
        </Button>
      </form>
    </Form>
  );
}
