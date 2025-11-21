"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const workRelationSchema = z.object({
  institutionName: z.string().min(2, "Nome do hospital/clínica"),
  contractType: z.enum(["CLT", "PJ", "Informal"]),
  hourlyRate: z.string().optional(), // input as string, convert later
})

type WorkRelationFormValues = z.infer<typeof workRelationSchema>

interface WorkRelationFormProps {
  onAdd: (data: WorkRelationFormValues) => void
  defaultValues?: Partial<WorkRelationFormValues>
}

export function WorkRelationForm({ onAdd, defaultValues }: WorkRelationFormProps) {
  const form = useForm<WorkRelationFormValues>({
    resolver: zodResolver(workRelationSchema),
    defaultValues: {
      institutionName: defaultValues?.institutionName ?? "",
      contractType: (defaultValues?.contractType as "CLT" | "PJ" | "Informal") ?? "CLT",
      hourlyRate: defaultValues?.hourlyRate ?? "",
    },
  })

  const handleSubmit = (data: WorkRelationFormValues) => {
    onAdd(data)
    if (!defaultValues) {
      form.reset()
    }
  }

  const isEditing = !!defaultValues

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="institutionName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Instituição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Hospital São Luiz" {...field} className="bg-white/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contractType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/50">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Informal">Informal</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Valor/Hora (Opcional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="R$ 0,00" {...field} className="bg-white/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full shadow-lg shadow-primary/20">
          {isEditing ? "Salvar Alterações" : "Adicionar Vínculo"}
        </Button>
      </form>
    </Form>
  )
}
