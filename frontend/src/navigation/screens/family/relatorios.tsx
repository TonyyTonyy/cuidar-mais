import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

type RelatoriosProps = {
  familyId: string;
};

type Estatisticas = {
  totalDoses: number;
  dosesTomadas: number;
  dosesAtrasadas: number;
  dosesPuladas: number;
  taxaAdesao: number;
  medicamentosMaisUsados: Array<{
    id: string;
    nome: string;
    doses: number;
    tipo: string;
  }>;
  horariosCriticos: Array<{
    horario: string;
    adesao: number;
    doses: number;
  }>;
};

const Relatorios = ({ familyId }: RelatoriosProps) => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('7dias');
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEstatisticas = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const daysMap: Record<string, number> = {
        '7dias': 7,
        '30dias': 30,
        '90dias': 90
      };
      
      const days = daysMap[periodoSelecionado];
      
      const response = await fetch(
        `${API_URL}/api/family/${familyId}/stats?days=${days}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEstatisticas(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Erro', 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEstatisticas();
  };

  const handleExport = (type: string) => {
    Alert.alert(
      'Em Desenvolvimento',
      `A exportação para ${type} estará disponível em breve!`,
      [{ text: 'OK' }]
    );
  };

  useEffect(() => {
    setLoading(true);
    loadEstatisticas();
  }, [familyId, periodoSelecionado]);

  const periodos = [
    { id: '7dias', label: '7 dias' },
    { id: '30dias', label: '30 dias' },
    { id: '90dias', label: '90 dias' }
  ];

  const getIconForMedicine = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('pressão') || tipoLower.includes('coração')) return 'heart';
    if (tipoLower.includes('diabetes') || tipoLower.includes('açúcar')) return 'water';
    if (tipoLower.includes('colesterol')) return 'pulse';
    if (tipoLower.includes('estômago') || tipoLower.includes('digestão')) return 'fitness';
    return 'medical';
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-8">
        <ActivityIndicator size="large" color="#4DA6FF" />
        <Text className="text-gray-600 mt-4">Carregando relatórios...</Text>
      </View>
    );
  }

  if (!estatisticas) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-8">
        <Ionicons name="analytics-outline" size={48} color="#D1D5DB" />
        <Text className="text-gray-500 mt-3 text-center">
          Não foi possível carregar os dados
        </Text>
      </View>
    );
  }

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

      <ScrollView 
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
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
              {estatisticas.taxaAdesao}%
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              nos últimos {periodos.find(p => p.id === periodoSelecionado)?.label}
            </Text>
          </VStack>

          <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
            <View
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${estatisticas.taxaAdesao}%` }}
            />
          </View>

          <HStack className="justify-between">
            <VStack>
              <Text className="text-2xl font-bold text-green-600">
                {estatisticas.dosesTomadas}
              </Text>
              <Text className="text-xs text-gray-600">Tomadas</Text>
            </VStack>
            <VStack>
              <Text className="text-2xl font-bold text-orange-600">
                {estatisticas.dosesAtrasadas}
              </Text>
              <Text className="text-xs text-gray-600">Atrasadas</Text>
            </VStack>
            <VStack>
              <Text className="text-2xl font-bold text-red-600">
                {estatisticas.dosesPuladas}
              </Text>
              <Text className="text-xs text-gray-600">Puladas</Text>
            </VStack>
            <VStack>
              <Text className="text-2xl font-bold text-gray-600">
                {estatisticas.totalDoses}
              </Text>
              <Text className="text-xs text-gray-600">Total</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Alertas */}
        {estatisticas.taxaAdesao < 80 && (
          <Box className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <HStack className="items-start">
              <Ionicons name="alert-circle" size={20} color="#F59E0B" />
              <VStack className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-amber-800 mb-1">
                  Atenção Necessária
                </Text>
                <Text className="text-xs text-amber-700">
                  A taxa de adesão está abaixo de 80%. Considere revisar os horários
                  dos medicamentos ou verificar se há alguma dificuldade.
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}

        {/* Medicamentos */}
        {estatisticas.medicamentosMaisUsados.length > 0 && (
          <Box className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
            <HStack className="items-center mb-3">
              <Ionicons name="medkit" size={20} color="#4DA6FF" />
              <Text className="text-base font-semibold text-gray-800 ml-2">
                Medicamentos no Período
              </Text>
            </HStack>

            {estatisticas.medicamentosMaisUsados.map((med, index) => (
              <Box
                key={med.id}
                className="mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0"
              >
                <HStack className="items-center justify-between">
                  <HStack className="items-center flex-1">
                    <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                      <Ionicons 
                        name={getIconForMedicine(med.tipo) as any} 
                        size={20} 
                        color="#4DA6FF" 
                      />
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
                      {med.doses} {med.doses === 1 ? 'dose' : 'doses'}
                    </Text>
                  </View>
                </HStack>
              </Box>
            ))}
          </Box>
        )}

        {/* Horários Críticos */}
        {estatisticas.horariosCriticos.length > 0 && (
          <Box className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
            <HStack className="items-center mb-3">
              <Ionicons name="time" size={20} color="#4DA6FF" />
              <Text className="text-base font-semibold text-gray-800 ml-2">
                Adesão por Horário
              </Text>
            </HStack>

            {estatisticas.horariosCriticos.map((horario, index) => (
              <Box key={index} className="mb-3 last:mb-0">
                <HStack className="items-center justify-between mb-1">
                  <HStack className="items-center">
                    <Ionicons name="alarm-outline" size={16} color="#6B7280" />
                    <Text className="text-sm font-medium text-gray-700 ml-2">
                      {horario.horario}
                    </Text>
                    <Text className="text-xs text-gray-500 ml-2">
                      ({horario.doses} {horario.doses === 1 ? 'dose' : 'doses'})
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
        )}

        {/* Exportar Dados */}
        <Box className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <HStack className="items-center mb-3">
            <Ionicons name="download" size={20} color="#4DA6FF" />
            <Text className="text-base font-semibold text-gray-800 ml-2">
              Exportar Dados
            </Text>
          </HStack>

          <VStack className="gap-2">
            <TouchableOpacity 
              className="bg-blue-50 p-3 rounded-lg"
              onPress={() => handleExport('PDF')}
            >
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

            <TouchableOpacity 
              className="bg-green-50 p-3 rounded-lg"
              onPress={() => handleExport('Excel')}
            >
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

            <TouchableOpacity 
              className="bg-purple-50 p-3 rounded-lg"
              onPress={() => handleExport('Compartilhar')}
            >
              <HStack className="items-center justify-between">
                <HStack className="items-center">
                  <Ionicons name="share-social" size={20} color="#A855F7" />
                  <Text className="text-sm font-medium text-gray-700 ml-2">
                    Compartilhar com Médico
                  </Text>
                </HStack>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </HStack>
            </TouchableOpacity>
          </VStack>
        </Box>

        {/* Mensagem de dados insuficientes */}
        {estatisticas.totalDoses === 0 && (
          <Box className="bg-gray-50 rounded-lg p-8 items-center">
            <Ionicons name="analytics-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-3 text-center">
              Ainda não há dados suficientes
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-1">
              Os relatórios aparecerão assim que houver registros de medicamentos
            </Text>
          </Box>
        )}
      </ScrollView>
    </View>
  );
};

export default Relatorios;