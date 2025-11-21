"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const profileSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  role: z.string().min(1, "Selecione sua profissão"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  onSubmit: (data: ProfileFormValues) => void
  defaultValues?: Partial<ProfileFormValues>
}

export function ProfileForm({ onSubmit, defaultValues }: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? "",
      role: defaultValues?.role ?? "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Ana Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissão</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="nurse">Enfermeiro(a)</SelectItem>
                  <SelectItem value="technician">Técnico(a) de Enfermagem</SelectItem>
                  <SelectItem value="doctor">Médico(a)</SelectItem>
                  <SelectItem value="physiotherapist">Fisioterapeuta</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Continuar
        </Button>
      </form>
    </Form>
  )
}

