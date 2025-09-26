import React from "react"
import { Ionicons } from "@expo/vector-icons"
import { VStack } from "@/components/ui/vstack"
import { HStack } from "@/components/ui/hstack"
import { Box } from "@/components/ui/box"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Button, ButtonText } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from "@/components/ui/select"

type Profile = {
  name: string
  age: number
}

type Medicamento = {
  nome: string
  tipo: string
  horario: string
  tomado: boolean
}

type InicioProps = {
  profiles: Record<string, Profile>
  selectedProfile: string
  setSelectedProfile: (value: string) => void
  medicamentosHoje: Medicamento[]
  setActiveTab: (tab: string) => void
  getStatusColor: (med: Medicamento) => string
  getStatusText: (med: Medicamento) => string
  getStatusIcon: (med: Medicamento) => any
}

export default function Inicio({
  profiles,
  selectedProfile,
  setSelectedProfile,
  medicamentosHoje,
  setActiveTab,
  getStatusColor,
  getStatusText,
  getStatusIcon,
}: InicioProps) {
  return (
    <VStack space="lg" className="p-4">
      <Card className="p-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Perfil que você está acompanhando:
        </Text>
        <Select selectedValue={selectedProfile} onValueChange={setSelectedProfile}>
          <SelectTrigger variant="outline" size="md">
            <SelectInput placeholder="Selecione um perfil" />
            <SelectIcon className="mr-3">
              <Ionicons name="chevron-down" size={20} />
            </SelectIcon>
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {Object.entries(profiles).map(([key, profile]) => (
                <SelectItem
                  key={key}
                  label={`${profile.name} (${profile.age} anos)`}
                  value={key}
                />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
      </Card>

      <Card className="p-4">
        <HStack className="justify-between items-center mb-4">
          <Heading size="md">Status de Hoje</Heading>
          <HStack className="items-center">
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </HStack>
        </HStack>

        <VStack space="sm">
          {medicamentosHoje.map((med, index) => {
            const statusText = getStatusText(med)
            const statusIcon = getStatusIcon(med)

            return (
              <Card
                key={index}
                className={`p-3 ${
                  med.tomado
                    ? "bg-green-50 border-green-200"
                    : new Date().getHours() >
                      parseInt(med.horario.split(":")[0])
                    ? "bg-red-50 border-red-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <HStack className="justify-between items-center">
                  <HStack className="items-center" space="sm">
                    <Ionicons
                      name={statusIcon}
                      size={20}
                      color={
                        med.tomado
                          ? "#16A34A"
                          : new Date().getHours() >
                            parseInt(med.horario.split(":")[0])
                          ? "#DC2626"
                          : "#9CA3AF"
                      }
                    />
                    <VStack>
                      <Text className="font-medium text-gray-800">{med.nome}</Text>
                      <Text className="text-sm text-gray-600 capitalize">
                        {med.tipo}
                      </Text>
                    </VStack>
                  </HStack>
                  <VStack className="items-end">
                    <Text className="font-medium text-gray-800">{med.horario}</Text>
                    <Text
                      className={`text-xs ${
                        med.tomado
                          ? "text-green-600"
                          : new Date().getHours() >
                            parseInt(med.horario.split(":")[0])
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {statusText}
                    </Text>
                  </VStack>
                </HStack>
              </Card>
            )
          })}
        </VStack>
      </Card>

      <HStack space="sm">
        <Card className="flex-1 p-4 bg-green-50 border-green-200">
          <VStack className="items-center">
            <Text className="text-2xl font-bold text-green-600">2</Text>
            <Text className="text-sm text-green-700">Tomados</Text>
          </VStack>
        </Card>
        <Card className="flex-1 p-4 bg-red-50 border-red-200">
          <VStack className="items-center">
            <Text className="text-2xl font-bold text-red-600">1</Text>
            <Text className="text-sm text-red-700">Atrasados</Text>
          </VStack>
        </Card>
        <Card className="flex-1 p-4 bg-gray-50 border-gray-200">
          <VStack className="items-center">
            <Text className="text-2xl font-bold text-gray-600">1</Text>
            <Text className="text-sm text-gray-700">Pendentes</Text>
          </VStack>
        </Card>
      </HStack>

      <HStack space="sm">
        <Button
          variant="outline"
          className="flex-1 bg-blue-50 border-blue-200"
          onPress={() => setActiveTab("historico")}
        >
          <HStack className="items-center" space="xs">
            <Ionicons name="time-outline" size={20} color="#2563EB" />
            <ButtonText className="text-blue-700">Ver Histórico</ButtonText>
          </HStack>
        </Button>
        <Button
          variant="outline"
          className="flex-1 bg-blue-50 border-blue-200"
          onPress={() => setActiveTab("relatorios")}
        >
          <HStack className="items-center" space="xs">
            <Ionicons name="bar-chart-outline" size={20} color="#2563EB" />
            <ButtonText className="text-blue-700">Relatórios</ButtonText>
          </HStack>
        </Button>
      </HStack>
    </VStack>
  )
}
