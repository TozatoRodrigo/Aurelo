"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { parseScheduleImage } from "@/app/actions/ocr"
import { Upload, Loader2, Check, AlertCircle, X, Pencil, Building2, FileText } from "lucide-react"
import { toast } from "sonner"
import { useShiftsStore } from "@/store/useShiftsStore"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { Label } from "@/components/ui/label"

export function OCRUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [parsedShifts, setParsedShifts] = useState<any[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [workRelations, setWorkRelations] = useState<any[]>([])
  const [processingStage, setProcessingStage] = useState<string>("")
  const { addShift } = useShiftsStore()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchRelations = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('work_relations').select('*').eq('user_id', user.id)
        if (data) setWorkRelations(data)
      }
    }
    fetchRelations()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Tipo de arquivo não suportado. Use JPG, PNG ou PDF")
        return
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        toast.error("Arquivo muito grande. Tamanho máximo: 10MB")
        return
      }

      setFile(selectedFile)
      setParsedShifts([])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setParsedShifts([])
    setProcessingStage("Enviando arquivo...")

    try {
      const formData = new FormData()
      formData.append("file", file)

      setProcessingStage("Processando com IA...")
      const result = await parseScheduleImage(formData)

      if (result.error) {
        toast.error("Erro na leitura: " + result.error)
        setProcessingStage("")
        return
      }

      if (result.shifts && result.shifts.length > 0) {
        setParsedShifts(result.shifts)
        setProcessingStage("")
        toast.success(`${result.shifts.length} plantão${result.shifts.length > 1 ? 'ões' : ''} encontrado${result.shifts.length > 1 ? 's' : ''}! Revise os dados antes de confirmar.`)
      } else {
        toast.warning("Nenhum plantão foi identificado na imagem")
        setProcessingStage("")
      }
    } catch (error: any) {
      console.error(error)
      toast.error("Erro ao processar imagem: " + (error.message || "Erro desconhecido"))
      setProcessingStage("")
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveShift = (index: number) => {
    setParsedShifts(parsedShifts.filter((_, i) => i !== index))
    toast.info("Plantão removido da lista")
  }

  const handleUpdateShift = (index: number, field: string, value: string) => {
    const newShifts = [...parsedShifts]
    newShifts[index] = { ...newShifts[index], [field]: value }
    setParsedShifts(newShifts)
  }

  const handleConfirmImport = async () => {
    if (parsedShifts.length === 0) {
      toast.error("Nenhum plantão para importar")
      return
    }

    let count = 0
    let errors = 0

    setUploading(true)
    setProcessingStage("Importando plantões...")

    for (const shift of parsedShifts) {
      try {
        const start = new Date(`${shift.date}T${shift.start_time}`)
        let end = new Date(`${shift.date}T${shift.end_time}`)

        if (end < start) {
          end.setDate(end.getDate() + 1)
        }

        await addShift({
          work_relation_id: shift.work_relation_id || null,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          estimated_value: shift.estimated_value || 0,
          notes: null,
        })
        count++
      } catch (e) {
        console.error(e)
        errors++
      }
    }

    setUploading(false)
    setProcessingStage("")

    if (errors > 0) {
      toast.warning(`${count} plantão${count > 1 ? 'ões' : ''} importado${count > 1 ? 's' : ''}, ${errors} com erro`)
    } else {
      toast.success(`${count} plantão${count > 1 ? 'ões' : ''} importado${count > 1 ? 's' : ''} com sucesso!`)
    }

    router.push("/escala")
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-12 bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm hover:from-white/80 hover:to-white/50 transition-all cursor-pointer relative overflow-hidden group"
        onClick={() => !uploading && document.getElementById('ocr-upload')?.click()}
      >
        {/* Animated border effect */}
        <motion.div
          className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-3xl"
        />

        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          id="ocr-upload"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <div className="flex flex-col items-center gap-3 relative z-10">
          {uploading ? (
            <motion.div
              className="p-4 rounded-2xl bg-primary/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              className="p-4 rounded-2xl bg-primary/10"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Upload className="h-8 w-8 text-primary" />
            </motion.div>
          )}
          <div className="text-center">
            <span className="text-sm font-semibold text-foreground block">
              {uploading ? processingStage : file ? file.name : "Toque para enviar foto da escala"}
            </span>
            <span className="text-xs text-muted-foreground mt-1 block">
              {uploading ? "Aguarde..." : "Suporta JPG, PNG ou PDF"}
            </span>
          </div>
        </div>
      </motion.div>

      {file && !parsedShifts.length && !uploading && (
        <Button className="w-full shadow-lg shadow-primary/20" onClick={handleUpload}>
          <FileText className="mr-2 h-4 w-4" />
          Processar Escala com IA
        </Button>
      )}

      {uploading && processingStage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl border border-primary/20"
        >
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-foreground">{processingStage}</span>
        </motion.div>
      )}

      {parsedShifts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold px-1 flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Plantões Identificados ({parsedShifts.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setParsedShifts([])
                setFile(null)
              }}
            >
              Limpar
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
            <AnimatePresence>
              {parsedShifts.map((shift, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-3 text-sm border-white/50 shadow-sm">
                    {editingIndex === i ? (
                      <div className="space-y-3">
                        <div className="flex gap-2 items-end">
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs text-muted-foreground">Data</Label>
                            <Input
                              type="date"
                              value={shift.date}
                              onChange={(e) => handleUpdateShift(i, 'date', e.target.value)}
                              className="h-9 text-xs"
                            />
                          </div>
                          <Button size="icon-sm" variant="ghost" onClick={() => setEditingIndex(null)}>
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Início</Label>
                            <Input
                              type="time"
                              value={shift.start_time}
                              onChange={(e) => handleUpdateShift(i, 'start_time', e.target.value)}
                              className="h-9 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Fim</Label>
                            <Input
                              type="time"
                              value={shift.end_time}
                              onChange={(e) => handleUpdateShift(i, 'end_time', e.target.value)}
                              className="h-9 text-xs"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Vínculo</Label>
                          <Select
                            value={shift.work_relation_id || ""}
                            onValueChange={(value) => handleUpdateShift(i, 'work_relation_id', value)}
                          >
                            <SelectTrigger className="h-9 text-xs bg-white/50">
                              <SelectValue placeholder="Selecionar vínculo" />
                            </SelectTrigger>
                            <SelectContent>
                              {workRelations.map(rel => (
                                <SelectItem key={rel.id} value={rel.id}>
                                  {rel.institution_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Valor Estimado (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={shift.estimated_value || ""}
                            onChange={(e) => handleUpdateShift(i, 'estimated_value', e.target.value)}
                            className="h-9 text-xs"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-semibold flex items-center gap-2">
                            {new Date(shift.date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                            {shift.institution && (
                              <span className="text-xs text-muted-foreground font-normal">
                                ({shift.institution})
                              </span>
                            )}
                          </div>
                          <div className="text-muted-foreground text-xs mt-1">
                            {shift.start_time} - {shift.end_time}
                          </div>
                          <div className="text-xs text-primary mt-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {workRelations.find(rel => rel.id === shift.work_relation_id)?.institution_name || "Sem vínculo"}
                          </div>
                          {shift.estimated_value > 0 && (
                            <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">
                              R$ {parseFloat(shift.estimated_value).toFixed(2)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon-sm" variant="ghost" onClick={() => setEditingIndex(i)}>
                            <Pencil className="w-3 h-3 text-muted-foreground" />
                          </Button>
                          <Button size="icon-sm" variant="ghost" onClick={() => handleRemoveShift(i)}>
                            <X className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl flex gap-2 text-xs text-yellow-800 dark:text-yellow-200"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Revise os dados acima antes de confirmar. Você pode editar qualquer campo clicando no ícone de lápis.</p>
          </motion.div>

          <Button
            className="w-full shadow-lg shadow-primary/20"
            onClick={handleConfirmImport}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {processingStage}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirmar Importação ({parsedShifts.length} plantão{parsedShifts.length > 1 ? 'ões' : ''})
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
