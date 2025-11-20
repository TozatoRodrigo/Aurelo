"use client"

import { OCRUploader } from "@/components/features/ocr/ocr-uploader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, Upload, FileImage } from "lucide-react"
import { motion } from "framer-motion"

export default function OCRPage() {
  return (
    <div className="space-y-6 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Importar Escala</h1>
            <p className="text-muted-foreground text-sm">
              Use IA para importar seus plantões automaticamente
            </p>
          </div>
        </div>
      </motion.div>

      <Card className="border-none shadow-lg bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Upload de Imagem ou PDF
          </CardTitle>
          <CardDescription>
            Tire uma foto da sua escala de papel ou envie um print PDF. 
            Nossa IA irá identificar seus plantões automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OCRUploader />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-accent/20">
                <FileImage className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Formatos Suportados</h3>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, PDF até 10MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">IA Inteligente</h3>
                <p className="text-xs text-muted-foreground">
                  Reconhece datas, horários e instituições
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
