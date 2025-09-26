import React from "react"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"

export default function Relatorios() {
  return (
    <Card className="p-6 m-4">
      <Heading size="md" className="mb-4">
        Relatórios
      </Heading>
      <Text className="text-gray-600">
        E aqui é a feature de gerar o relatório com estatísticas gerais e gráficos talvez
      </Text>
    </Card>
  )
}
