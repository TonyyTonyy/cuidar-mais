import React, { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { VStack } from "@/components/ui/vstack"
import { HStack } from "@/components/ui/hstack"
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
import { ActivityIndicator, RefreshControl, ScrollView } from "react-native"

type Profile = {
  name: string
  age: number
  email: string
}

type Medicamento = {
  id: string
  medicationId: string
  reminderId: string
  nome: string
  tipo: string
  horario: string
  tomado: boolean
  status?: string
  color?: string
}

type InicioProps = {
  profiles: Record<string, Profile>
  selectedProfile: string | null
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
  const [refreshing, setRefreshing] = useState(false)

  // Calcular estatísticas
  const totalMedicamentos = medicamentosHoje.length
  const medicamentosTomados = medicamentosHoje.filter(m => m.tomado || m.status === 'taken').length
  const medicamentosAtrasados = medicamentosHoje.filter(m => {
    if (m.status === 'late') return true
    if (m.tomado || m.status === 'taken') return false
    const horarioMed = parseInt(m.horario.split(':')[0])
    return new Date().getHours() > horarioMed
  }).length
  const medicamentosPendentes = totalMedicamentos - medicamentosTomados - medicamentosAtrasados

  const handleRefresh = async () => {
    setRefreshing(true)
    // O refresh será tratado pelo componente pai
    setTimeout(() => setRefreshing(false), 1000)
  }

  // Verificar se há perfis disponíveis
  const hasProfiles = Object.keys(profiles).length > 0
  const currentProfile = selectedProfile ? profiles[selectedProfile] : null

  if (!hasProfiles) {
    return (
      <VStack space="lg" className="p-4">
        <Card className="p-8 items-center">
          <Ionicons name="people-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-500 mt-4 text-center font-medium">
            Nenhum Familiar Conectado
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-2">
            Adicione familiares na aba "Familiares" para começar a monitorar seus medicamentos
          </Text>
          <Button
            className="mt-6 bg-[#4DA6FF] data-[hover=true]:bg-[#3B82F6]"
            onPress={() => setActiveTab('familiares')}
          >
            <HStack className="items-center" space="xs">
              <Ionicons name="add" size={18} color="white" />
              <ButtonText>Adicionar Familiar</ButtonText>
            </HStack>
          </Button>
        </Card>
      </VStack>
    )
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <VStack space="lg" className="p-4">
        {/* Seletor de Perfil */}
        <Card className="p-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Perfil que você está acompanhando:
          </Text>
          <Select 
            selectedValue={selectedProfile || undefined} 
            onValueChange={setSelectedProfile}
          >
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
                    label={`${profile.name}${profile.age ? ` (${profile.age} anos)` : ''}`}
                    value={key}
                  />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>

          {currentProfile && (
            <HStack className="mt-3 items-center">
              <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-2">
                Monitorando medicamentos de {currentProfile.name}
              </Text>
            </HStack>
          )}
        </Card>

        {!selectedProfile ? (
          <Card className="p-6 items-center">
            <Ionicons name="arrow-up-outline" size={32} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2 text-center">
              Selecione um perfil acima para ver os medicamentos
            </Text>
          </Card>
        ) : medicamentosHoje.length === 0 ? (
          <Card className="p-8 items-center">
            <Ionicons name="medical-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-3 text-center">
              Nenhum medicamento para hoje
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-1">
              Este familiar ainda não tem medicamentos cadastrados ou não há lembretes para hoje
            </Text>
          </Card>
        ) : (
          <>
            {/* Status de Hoje */}
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
                      key={med.id}
                      className={`p-3 ${
                        med.tomado || med.status === 'taken'
                          ? "bg-green-50 border-green-200"
                          : new Date().getHours() >
                            parseInt(med.horario.split(":")[0]) || med.status === 'late'
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <HStack className="justify-between items-center">
                        <HStack className="items-center flex-1" space="sm">
                          <Ionicons
                            name={statusIcon}
                            size={20}
                            color={
                              med.tomado || med.status === 'taken'
                                ? "#16A34A"
                                : new Date().getHours() >
                                  parseInt(med.horario.split(":")[0]) || med.status === 'late'
                                ? "#DC2626"
                                : "#9CA3AF"
                            }
                          />
                          <VStack className="flex-1">
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
                              med.tomado || med.status === 'taken'
                                ? "text-green-600"
                                : new Date().getHours() >
                                  parseInt(med.horario.split(":")[0]) || med.status === 'late'
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

            {/* Resumo Estatístico */}
            <HStack space="sm">
              <Card className="flex-1 p-4 bg-green-50 border-green-200">
                <VStack className="items-center">
                  <Text className="text-2xl font-bold text-green-600">
                    {medicamentosTomados}
                  </Text>
                  <Text className="text-sm text-green-700">Tomados</Text>
                </VStack>
              </Card>
              <Card className="flex-1 p-4 bg-red-50 border-red-200">
                <VStack className="items-center">
                  <Text className="text-2xl font-bold text-red-600">
                    {medicamentosAtrasados}
                  </Text>
                  <Text className="text-sm text-red-700">Atrasados</Text>
                </VStack>
              </Card>
              <Card className="flex-1 p-4 bg-gray-50 border-gray-200">
                <VStack className="items-center">
                  <Text className="text-2xl font-bold text-gray-600">
                    {medicamentosPendentes}
                  </Text>
                  <Text className="text-sm text-gray-700">Pendentes</Text>
                </VStack>
              </Card>
            </HStack>

            {/* Alertas */}
            {medicamentosAtrasados > 0 && (
              <Card className="p-4 bg-red-50 border-red-200">
                <HStack className="items-start">
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <VStack className="flex-1 ml-3">
                    <Text className="text-sm font-semibold text-red-800 mb-1">
                      Atenção Necessária
                    </Text>
                    <Text className="text-xs text-red-700">
                      {medicamentosAtrasados === 1 
                        ? 'Há 1 medicamento atrasado.' 
                        : `Há ${medicamentosAtrasados} medicamentos atrasados.`}
                      {' '}Entre em contato com o familiar para verificar.
                    </Text>
                  </VStack>
                </HStack>
              </Card>
            )}

            {medicamentosTomados === totalMedicamentos && totalMedicamentos > 0 && (
              <Card className="p-4 bg-green-50 border-green-200">
                <HStack className="items-start">
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  <VStack className="flex-1 ml-3">
                    <Text className="text-sm font-semibold text-green-800 mb-1">
                      Parabéns! 🎉
                    </Text>
                    <Text className="text-xs text-green-700">
                      Todos os medicamentos foram tomados hoje. Continue assim!
                    </Text>
                  </VStack>
                </HStack>
              </Card>
            )}

            {/* Botões de Navegação */}
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
          </>
        )}
      </VStack>
    </ScrollView>
  )
}