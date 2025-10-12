import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from '@expo/vector-icons';

const Relatorios = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('7dias');

  const estatisticas: Record<string, any> = {
    '7dias': {
      totalDoses: 28,
      dosesTomadas: 24,
      dosesAtrasadas: 3,
      dosesPuladas: 1,
      taxaAdesao: 86
    },
    '30dias': {
      totalDoses: 120,
      dosesTomadas: 105,
      dosesAtrasadas: 10,
      dosesPuladas: 5,
      taxaAdesao: 88
    },
    '90dias': {
      totalDoses: 360,
      dosesTomadas: 320,
      dosesAtrasadas: 28,
      dosesPuladas: 12,
      taxaAdesao: 89
    }
  };

  const medicamentosMaisUsados = [
    { nome: 'Losartana', doses: 2, tipo: 'Pressão', icone: 'heart' },
    { nome: 'Metformina', doses: 5, tipo: 'Diabetes', icone: 'water' },
    { nome: 'Sinvastatina', doses: 4, tipo: 'Colesterol', icone: 'pulse' },
    { nome: 'Omeprazol', doses: 7, tipo: 'Estômago', icone: 'fitness' }
  ];

  const horariosCriticos = [
    { horario: '08:00', adesao: 95, doses: 7 },
    { horario: '12:00', adesao: 90, doses: 7 },
    { horario: '14:30', adesao: 75, doses: 7 },
    { horario: '20:00', adesao: 85, doses: 7 }
  ];

  const alertas = [
    {
      id: 1,
      tipo: 'atencao',
      mensagem: 'Taxa de adesão abaixo da meta em horários da tarde',
      icone: 'alert-circle'
    },
    {
      id: 2,
      tipo: 'info',
      mensagem: 'Melhor performance nos horários da manhã (95%)',
      icone: 'information-circle'
    }
  ];

  const periodos = [
    { id: '7dias', label: '7 dias' },
    { id: '30dias', label: '30 dias' },
    { id: '90dias', label: '90 dias' }
  ];

  const stats = estatisticas[periodoSelecionado];

  return (
    <View className="flex-1 bg-gray-50">
      <Box className="bg-white px-4 py-3 border-b border-gray-200">
        <HStack className="gap-2">
          {periodos.map(periodo => (
            <TouchableOpacity
              key={periodo.id}
              onPress={() => setPeriodoSelecionado(periodo.id)}
              className={`flex-1 py-2 px-3 rounded-lg border ${
                periodoSelecionado === periodo.id
                  ? 'bg-blue-50 border-blue-400'
                  : 'bg-white border-gray-300'
              }`}
            >
              <Text
                className={`text-xs text-center font-medium ${
                  periodoSelecionado === periodo.id ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {periodo.label}
              </Text>
            </TouchableOpacity>
          ))}
        </HStack>
      </Box>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Taxa de Adesão */}
        <Box className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <HStack className="items-center mb-3">
            <Ionicons name="stats-chart" size={20} color="#4DA6FF" />
            <Text className="text-base font-semibold text-gray-800 ml-2">
              Taxa de Adesão
            </Text>
          </HStack>
          
          <VStack className="items-center mb-3">
            <Text className="text-4xl font-bold text-blue-600">
              {stats.taxaAdesao}%
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              nos últimos {periodos.find(p => p.id === periodoSelecionado)?.label}
            </Text>
          </VStack>

          <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
            <View
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${stats.taxaAdesao}%` }}
            />
          </View>

          <HStack className="justify-between">
            <VStack>
              <Text className="text-2xl font-bold text-green-600">
                {stats.dosesTomadas}
              </Text>
              <Text className="text-xs text-gray-600">Tomadas</Text>
            </VStack>
            <VStack>
              <Text className="text-2xl font-bold text-orange-600">
                {stats.dosesAtrasadas}
              </Text>
              <Text className="text-xs text-gray-600">Atrasadas</Text>
            </VStack>
            <VStack>
              <Text className="text-2xl font-bold text-red-600">
                {stats.dosesPuladas}
              </Text>
              <Text className="text-xs text-gray-600">Puladas</Text>
            </VStack>
            <VStack>
              <Text className="text-2xl font-bold text-gray-600">
                {stats.totalDoses}
              </Text>
              <Text className="text-xs text-gray-600">Total</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Medicamentos */}
        <Box className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <HStack className="items-center mb-3">
            <Ionicons name="medkit" size={20} color="#4DA6FF" />
            <Text className="text-base font-semibold text-gray-800 ml-2">
              Medicamentos
            </Text>
          </HStack>

          {medicamentosMaisUsados.map((med, index) => (
            <Box
              key={index}
              className="mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0"
            >
              <HStack className="items-center justify-between">
                <HStack className="items-center flex-1">
                  <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                    <Ionicons name={med.icone as any} size={20} color="#4DA6FF" />
                  </View>
                  <VStack className="flex-1">
                    <Text className="text-sm font-semibold text-gray-800">
                      {med.nome}
                    </Text>
                    <Text className="text-xs text-gray-500">{med.tipo}</Text>
                  </VStack>
                </HStack>
                <View className="bg-blue-50 px-3 py-1 rounded-full">
                  <Text className="text-sm font-semibold text-blue-600">
                    {med.doses} doses
                  </Text>
                </View>
              </HStack>
            </Box>
          ))}
        </Box>

        {/* Horários Críticos */}
        <Box className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <HStack className="items-center mb-3">
            <Ionicons name="time" size={20} color="#4DA6FF" />
            <Text className="text-base font-semibold text-gray-800 ml-2">
              Adesão por Horário
            </Text>
          </HStack>

          {horariosCriticos.map((horario, index) => (
            <Box key={index} className="mb-3 last:mb-0">
              <HStack className="items-center justify-between mb-1">
                <HStack className="items-center">
                  <Ionicons name="alarm-outline" size={16} color="#6B7280" />
                  <Text className="text-sm font-medium text-gray-700 ml-2">
                    {horario.horario}
                  </Text>
                </HStack>
                <Text className="text-sm font-semibold text-gray-800">
                  {horario.adesao}%
                </Text>
              </HStack>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className={`h-full rounded-full ${
                    horario.adesao >= 90
                      ? 'bg-green-500'
                      : horario.adesao >= 75
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${horario.adesao}%` }}
                />
              </View>
            </Box>
          ))}
        </Box>

        <Box className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <HStack className="items-center mb-3">
            <Ionicons name="download" size={20} color="#4DA6FF" />
            <Text className="text-base font-semibold text-gray-800 ml-2">
              Exportar Dados
            </Text>
          </HStack>

          <VStack className="gap-2">
            <TouchableOpacity className="bg-blue-50 p-3 rounded-lg">
              <HStack className="items-center justify-between">
                <HStack className="items-center">
                  <Ionicons name="document-text" size={20} color="#4DA6FF" />
                  <Text className="text-sm font-medium text-gray-700 ml-2">
                    Gerar Relatório PDF
                  </Text>
                </HStack>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </HStack>
            </TouchableOpacity>

            <TouchableOpacity className="bg-green-50 p-3 rounded-lg">
              <HStack className="items-center justify-between">
                <HStack className="items-center">
                  <Ionicons name="grid" size={20} color="#5FD068" />
                  <Text className="text-sm font-medium text-gray-700 ml-2">
                    Exportar para Excel
                  </Text>
                </HStack>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </HStack>
            </TouchableOpacity>

            <TouchableOpacity className="bg-purple-50 p-3 rounded-lg">
              <HStack className="items-center justify-between">
                <HStack className="items-center">
                  <Ionicons name="share-social" size={20} color="#A855F7" />
                  <Text className="text-sm font-medium text-gray-700 ml-2">
                    Compartilhar
                  </Text>
                </HStack>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </HStack>
            </TouchableOpacity>
          </VStack>
        </Box>
      </ScrollView>
    </View>
  );
};

export default Relatorios;