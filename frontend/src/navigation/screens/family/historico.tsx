import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

type HistoricoProps = {
  familyId: string;
};

type LogItem = {
  id: string;
  medicationId: string;
  takenAt: string;
  scheduledTime: string;
  status: string;
  medication: {
    id: string;
    name: string;
    dosage: string;
    color: string;
  };
};

const Historico = ({ familyId }: HistoricoProps) => {
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [periodoSelecionado, setPeriodoSelecionado] = useState('7dias');
  const [historico, setHistorico] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistorico = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      // Mapear período para dias
      const daysMap: Record<string, number> = {
        '7dias': 7,
        '30dias': 30,
        '90dias': 90
      };
      
      const days = daysMap[periodoSelecionado];
      
      // Adicionar filtro de status se não for "todos"
      let url = `${API_URL}/api/family/${familyId}/logs?days=${days}`;
      if (filtroAtivo !== 'todos') {
        url += `&status=${filtroAtivo}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistorico(data);
      }
    } catch (error) {
      console.error('Error loading historico:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistorico();
  };

  useEffect(() => {
    setLoading(true);
    loadHistorico();
  }, [familyId, filtroAtivo, periodoSelecionado]);

  const getStatusConfig = (status: string) => {
    const configs: any = {
      taken: {
        color: '#5FD068',
        bgColor: '#E8F5E9',
        icon: 'checkmark-circle' as const,
        label: 'Tomado'
      },
      late: {
        color: '#FFA726',
        bgColor: '#FFF3E0',
        icon: 'time' as const,
        label: 'Atrasado'
      },
      skipped: {
        color: '#FF6B6B',
        bgColor: '#FFEBEE',
        icon: 'close-circle' as const,
        label: 'Pulado'
      }
    };
    return configs[status] || configs.taken;
  };

  const filtros = [
    { id: 'todos', label: 'Todos', icon: 'list' as const },
    { id: 'taken', label: 'Tomados', icon: 'checkmark-circle' as const },
    { id: 'late', label: 'Atrasados', icon: 'time' as const },
    { id: 'skipped', label: 'Pulados', icon: 'close-circle' as const }
  ];

  const periodos = [
    { id: '7dias', label: '7 dias' },
    { id: '30dias', label: '30 dias' },
    { id: '90dias', label: '90 dias' }
  ];

  const agruparPorData = (dados: LogItem[]) => {
    const grupos: Record<string, LogItem[]> = {};
    dados.forEach(item => {
      const data = new Date(item.takenAt).toLocaleDateString('pt-BR');
      if (!grupos[data]) {
        grupos[data] = [];
      }
      grupos[data].push(item);
    });
    return grupos;
  };

  const historicoPorData = agruparPorData(historico);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-8">
        <ActivityIndicator size="large" color="#4DA6FF" />
        <Text className="text-gray-600 mt-4">Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Box className="bg-white px-4 py-3 border-b border-gray-200">
        <HStack className="gap-2 mb-3">
          {filtros.map(filtro => (
            <TouchableOpacity
              key={filtro.id}
              onPress={() => setFiltroAtivo(filtro.id)}
              className={`flex-1 py-2 px-3 rounded-lg ${
                filtroAtivo === filtro.id ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <HStack className="items-center justify-center gap-1">
                <Ionicons
                  name={filtro.icon}
                  size={16}
                  color={filtroAtivo === filtro.id ? '#4DA6FF' : '#6B7280'}
                />
                <Text
                  className={`text-xs font-medium ${
                    filtroAtivo === filtro.id ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {filtro.label}
                </Text>
              </HStack>
            </TouchableOpacity>
          ))}
        </HStack>

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
        className="flex-1 px-4 py-3"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {Object.entries(historicoPorData).length === 0 ? (
          <Box className="items-center justify-center py-12">
            <Ionicons name="file-tray-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-3 text-center">
              Nenhum registro encontrado
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-1">
              Altere os filtros para ver mais resultados
            </Text>
          </Box>
        ) : (
          Object.entries(historicoPorData).map(([data, items]) => (
            <Box key={data} className="mb-4">
              <HStack className="items-center mb-2">
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  {data}
                </Text>
                <View className="flex-1 h-px bg-gray-300 ml-2" />
                <Text className="text-xs text-gray-500 ml-2">
                  {items.length} {items.length === 1 ? 'registro' : 'registros'}
                </Text>
              </HStack>

              {items.map(item => {
                const statusConfig = getStatusConfig(item.status);
                return (
                  <Box
                    key={item.id}
                    className="bg-white rounded-lg p-4 mb-2 border border-gray-200"
                  >
                    <HStack className="items-start justify-between mb-2">
                      <HStack className="items-center flex-1">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: statusConfig.bgColor }}
                        >
                          <Ionicons
                            name={statusConfig.icon}
                            size={20}
                            color={statusConfig.color}
                          />
                        </View>
                        <VStack className="flex-1">
                          <Text className="text-base font-semibold text-gray-800">
                            {item.medication.name}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {item.medication.dosage}
                          </Text>
                        </VStack>
                      </HStack>
                      <View
                        className="px-2 py-1 rounded-md"
                        style={{ backgroundColor: statusConfig.bgColor }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{ color: statusConfig.color }}
                        >
                          {statusConfig.label}
                        </Text>
                      </View>
                    </HStack>

                    <VStack className="gap-1">
                      <HStack className="items-center">
                        <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                        <Text className="text-xs text-gray-600 ml-2">
                          Horário previsto: {item.scheduledTime}
                        </Text>
                      </HStack>
                      <HStack className="items-center">
                        <Ionicons name="checkmark-circle-outline" size={14} color="#9CA3AF" />
                        <Text className="text-xs text-gray-600 ml-2">
                          Registrado às {new Date(item.takenAt).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                );
              })}
            </Box>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default Historico;