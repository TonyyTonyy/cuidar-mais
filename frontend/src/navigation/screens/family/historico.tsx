// historico.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from '@expo/vector-icons';

const Historico = () => {
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [periodoSelecionado, setPeriodoSelecionado] = useState('7dias');

  const historico = [
    {
      id: 1,
      data: '12/10/2025',
      horario: '20:30',
      medicamento: 'Sinvastatina',
      status: 'tomado',
      registradoPor: 'Ana Silva',
      observacao: null
    },
    {
      id: 2,
      data: '12/10/2025',
      horario: '14:45',
      medicamento: 'Omeprazol',
      status: 'atrasado',
      registradoPor: 'Maria Silva',
      observacao: 'Tomado com 15 minutos de atraso'
    },
    {
      id: 3,
      data: '12/10/2025',
      horario: '12:00',
      medicamento: 'Metformina',
      status: 'tomado',
      registradoPor: 'Maria Silva',
      observacao: null
    },
    {
      id: 4,
      data: '12/10/2025',
      horario: '08:00',
      medicamento: 'Losartana',
      status: 'tomado',
      registradoPor: 'Ana Silva',
      observacao: null
    },
    {
      id: 5,
      data: '11/10/2025',
      horario: '20:00',
      medicamento: 'Sinvastatina',
      status: 'pulado',
      registradoPor: 'Ana Silva',
      observacao: 'Paciente passou mal'
    },
    {
      id: 6,
      data: '11/10/2025',
      horario: '14:30',
      medicamento: 'Omeprazol',
      status: 'tomado',
      registradoPor: 'Carlos Silva',
      observacao: null
    },
    {
      id: 7,
      data: '11/10/2025',
      horario: '12:00',
      medicamento: 'Metformina',
      status: 'tomado',
      registradoPor: 'Maria Silva',
      observacao: null
    },
    {
      id: 8,
      data: '11/10/2025',
      horario: '08:00',
      medicamento: 'Losartana',
      status: 'atrasado',
      registradoPor: 'Ana Silva',
      observacao: 'Tomado 1 hora depois'
    },
    {
      id: 9,
      data: '10/10/2025',
      horario: '20:00',
      medicamento: 'Sinvastatina',
      status: 'tomado',
      registradoPor: 'Rosa Santos',
      observacao: null
    },
    {
      id: 10,
      data: '10/10/2025',
      horario: '14:30',
      medicamento: 'Omeprazol',
      status: 'tomado',
      registradoPor: 'Rosa Santos',
      observacao: null
    }
  ];

  const getStatusConfig = (status: string) => {
    const configs: any = {
      tomado: {
        color: '#5FD068',
        bgColor: '#E8F5E9',
        icon: 'checkmark-circle' as const,
        label: 'Tomado'
      },
      atrasado: {
        color: '#FFA726',
        bgColor: '#FFF3E0',
        icon: 'time' as const,
        label: 'Atrasado'
      },
      pulado: {
        color: '#FF6B6B',
        bgColor: '#FFEBEE',
        icon: 'close-circle' as const,
        label: 'Pulado'
      }
    };
    return configs[status] || configs.tomado;
  };

  const filtros = [
    { id: 'todos', label: 'Todos', icon: 'list' as const },
    { id: 'tomado', label: 'Tomados', icon: 'checkmark-circle' as const },
    { id: 'atrasado', label: 'Atrasados', icon: 'time' as const },
    { id: 'pulado', label: 'Pulados', icon: 'close-circle' as const }
  ];

  const periodos = [
    { id: '7dias', label: '7 dias' },
    { id: '30dias', label: '30 dias' },
    { id: '90dias', label: '90 dias' }
  ];

  const historicoFiltrado = historico.filter(item => 
    filtroAtivo === 'todos' || item.status === filtroAtivo
  );

  const agruparPorData = (dados: typeof historico) => {
    const grupos: Record<string, typeof historico> = {};
    dados.forEach(item => {
      if (!grupos[item.data]) {
        grupos[item.data] = [];
      }
      grupos[item.data].push(item);
    });
    return grupos;
  };

  const historicoPorData = agruparPorData(historicoFiltrado);

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

      <ScrollView className="flex-1 px-4 py-3">
        {Object.entries(historicoPorData).map(([data, items]) => (
          <Box key={data} className="mb-4">
            <HStack className="items-center mb-2">
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-700 ml-2">
                {data}
              </Text>
              <View className="flex-1 h-px bg-gray-300 ml-2" />
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
                          {item.medicamento}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {item.horario}
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
                      <Ionicons name="person-outline" size={14} color="#9CA3AF" />
                      <Text className="text-xs text-gray-600 ml-2">
                        Registrado por {item.registradoPor}
                      </Text>
                    </HStack>
                    {item.observacao && (
                      <HStack className="items-start mt-1">
                        <Ionicons
                          name="chatbox-ellipses-outline"
                          size={14}
                          color="#9CA3AF"
                        />
                        <Text className="text-xs text-gray-600 ml-2 flex-1">
                          {item.observacao}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              );
            })}
          </Box>
        ))}

        {historicoFiltrado.length === 0 && (
          <Box className="items-center justify-center py-12">
            <Ionicons name="file-tray-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-3 text-center">
              Nenhum registro encontrado
            </Text>
          </Box>
        )}
      </ScrollView>
    </View>
  );
};

export default Historico;