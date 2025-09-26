import React from "react"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"

export default function Historico() {
  return (
    <Card className="p-6 m-4">
      <Heading size="md" className="mb-4">
        Histórico de Medicamentos
      </Heading>
      <Text className="text-gray-600">
        Aqui vai mostrar o histórico de uso de medicamentos pelo "paciente/familiar" com filtro de data e medicamento
      </Text>
    </Card>
  )
}
