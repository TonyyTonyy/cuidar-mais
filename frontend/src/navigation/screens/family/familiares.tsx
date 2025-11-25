import React, { useState, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { VStack } from "@/components/ui/vstack"
import { HStack } from "@/components/ui/hstack"
import { Card } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Text } from "@/components/ui/text"
import { Button, ButtonText } from "@/components/ui/button"
import { Input, InputField } from "@/components/ui/input"
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
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar"
import { Badge, BadgeText } from "@/components/ui/badge"
import { ActivityIndicator, Alert, RefreshControl, ScrollView } from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

type Familiar = {
  id: string
  familiarId: string
  nome: string
  email: string
  picture?: string
  age?: number
  parentesco: string
  status: string 
  permissoes: string
  contato: string
}

type NovoFamiliar = {
  email: string
  parentesco: string
  permissoes: string
}

type Convite = {
  id: string
  familiarId: string
  nome: string
  email: string
  picture?: string
  age?: number
  parentesco: string
  permissoes: string
  createdAt: string
}

type FamiliaresProps = {
  familiares: Familiar[]
  showAddForm: boolean
  setShowAddForm: (value: boolean) => void
  newFamiliar: NovoFamiliar
  setNewFamiliar: (value: NovoFamiliar) => void
  handleAddFamiliar: () => void
  handleRemoveFamiliar: (id: string) => void
  onRefresh: () => void
}

export default function Familiares({
  familiares,
  showAddForm,
  setShowAddForm,
  newFamiliar,
  setNewFamiliar,
  handleAddFamiliar,
  handleRemoveFamiliar,
  onRefresh
}: FamiliaresProps) {
  const [convitesPendentes, setConvitesPendentes] = useState<Convite[]>([]);
  const [loadingConvites, setLoadingConvites] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carregar convites pendentes
  const loadConvites = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/family/invites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConvitesPendentes(data);
      }
    } catch (error) {
      console.error('Error loading invites:', error);
    } finally {
      setLoadingConvites(false);
    }
  };

  // Aceitar convite
  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `${API_URL}/api/family/invites/${inviteId}/accept`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        Alert.alert('Sucesso', 'Convite aceito!');
        loadConvites();
        onRefresh();
      } else {
        Alert.alert('Erro', 'Erro ao aceitar convite');
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      Alert.alert('Erro', 'Erro ao aceitar convite');
    }
  };

  // Rejeitar convite
  const handleRejectInvite = async (inviteId: string) => {
    Alert.alert(
      'Rejeitar Convite',
      'Tem certeza que deseja rejeitar este convite?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              const response = await fetch(
                `${API_URL}/api/family/invites/${inviteId}/reject`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );

              if (response.ok) {
                Alert.alert('Sucesso', 'Convite rejeitado');
                loadConvites();
              }
            } catch (error) {
              console.error('Error rejecting invite:', error);
              Alert.alert('Erro', 'Erro ao rejeitar convite');
            }
          }
        }
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadConvites(), onRefresh()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadConvites();
  }, []);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <VStack space="lg" className="p-4">
        {/* Convites Pendentes */}
        {loadingConvites ? (
          <Card className="p-4 items-center">
            <ActivityIndicator size="small" color="#4DA6FF" />
            <Text className="text-sm text-gray-600 mt-2">
              Carregando convites...
            </Text>
          </Card>
        ) : convitesPendentes.length > 0 && (
          <Card className="p-4">
            <HStack className="items-center mb-3">
              <Ionicons name="mail-outline" size={20} color="#F59E0B" />
              <Heading size="sm" className="ml-2">
                Convites Pendentes ({convitesPendentes.length})
              </Heading>
            </HStack>

            <VStack space="sm">
              {convitesPendentes.map((convite) => (
                <Card key={convite.id} className="p-3 bg-amber-50 border-amber-200">
                  <HStack className="justify-between items-center mb-2">
                    <HStack className="items-center flex-1" space="sm">
                      <Avatar size="sm" className="bg-amber-400/20">
                        {convite.picture ? (
                          <AvatarImage source={{ uri: convite.picture }} />
                        ) : (
                          <AvatarFallbackText className="text-amber-600">
                            {convite.nome.charAt(0)}
                          </AvatarFallbackText>
                        )}
                      </Avatar>
                      <VStack className="flex-1">
                        <Text className="font-medium text-gray-800">
                          {convite.nome}
                        </Text>
                        <Text className="text-xs text-gray-600">
                          {convite.email}
                        </Text>
                      </VStack>
                    </HStack>
                  </HStack>

                  <HStack space="xs">
                    <Button
                      size="xs"
                      className="flex-1 bg-green-500 data-[hover=true]:bg-green-600"
                      onPress={() => handleAcceptInvite(convite.id)}
                    >
                      <HStack className="items-center" space="xs">
                        <Ionicons name="checkmark" size={14} color="white" />
                        <ButtonText className="text-xs">Aceitar</ButtonText>
                      </HStack>
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      className="flex-1 border-red-300 data-[hover=true]:bg-red-50"
                      onPress={() => handleRejectInvite(convite.id)}
                    >
                      <HStack className="items-center" space="xs">
                        <Ionicons name="close" size={14} color="#DC2626" />
                        <ButtonText className="text-xs text-red-600">
                          Rejeitar
                        </ButtonText>
                      </HStack>
                    </Button>
                  </HStack>
                </Card>
              ))}
            </VStack>
          </Card>
        )}

        {/* Header */}
        <HStack className="justify-between items-center">
          <Heading size="md">Cuidadores e Familiares</Heading>
          <Button
            className="bg-[#4DA6FF] data-[hover=true]:bg-[#3B82F6]"
            size="sm"
            onPress={() => setShowAddForm(true)}
          >
            <HStack className="items-center" space="xs">
              <Ionicons name="add" size={16} color="white" />
              <ButtonText>Adicionar</ButtonText>
            </HStack>
          </Button>
        </HStack>

        {/* Formulário de Adicionar */}
        {showAddForm && (
          <Card className="p-6">
            <Heading size="sm" className="mb-4">
              Enviar Convite
            </Heading>
            <VStack space="md">
              <VStack space="xs">
                <Text className="text-sm font-medium text-gray-700">
                  E-mail do Familiar *
                </Text>
                <Input>
                  <InputField
                    value={newFamiliar.email}
                    onChangeText={(text) =>
                      setNewFamiliar({ ...newFamiliar, email: text })
                    }
                    placeholder="email@exemplo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Input>
                <Text className="text-xs text-gray-500">
                  O familiar receberá um convite no app
                </Text>
              </VStack>

              <VStack space="xs">
                <Text className="text-sm font-medium text-gray-700">
                  Parentesco
                </Text>
                <Select
                  selectedValue={newFamiliar.parentesco}
                  onValueChange={(value) =>
                    setNewFamiliar({ ...newFamiliar, parentesco: value })
                  }
                >
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Selecione o parentesco" />
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
                      <SelectItem label="Filho" value="filho" />
                      <SelectItem label="Filha" value="filha" />
                      <SelectItem label="Neto" value="neto" />
                      <SelectItem label="Neta" value="neta" />
                      <SelectItem label="Cuidador" value="cuidador" />
                      <SelectItem label="Outro" value="outro" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </VStack>

              <VStack space="xs">
                <Text className="text-sm font-medium text-gray-700">
                  Permissões
                </Text>
                <Select
                  selectedValue={newFamiliar.permissoes}
                  onValueChange={(value) =>
                    setNewFamiliar({ ...newFamiliar, permissoes: value })
                  }
                >
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Selecione as permissões" />
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
                      <SelectItem
                        label="Apenas Visualização"
                        value="view"
                      />
                      <SelectItem
                        label="Visualização + Notificações"
                        value="view_notifications"
                      />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </VStack>

              <HStack space="sm" className="pt-4">
                <Button
                  className="flex-1 bg-[#4DA6FF] data-[hover=true]:bg-[#3B82F6]"
                  onPress={handleAddFamiliar}
                >
                  <ButtonText>Enviar Convite</ButtonText>
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onPress={() => setShowAddForm(false)}
                >
                  <ButtonText>Cancelar</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </Card>
        )}

        {/* Lista de Familiares */}
        {familiares.length === 0 ? (
          <Card className="p-8 items-center">
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-3 text-center">
              Nenhum familiar conectado ainda
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-1">
              Adicione familiares para monitorar seus medicamentos
            </Text>
          </Card>
        ) : (
          <VStack space="sm">
            {familiares.map((familiar) => (
              <Card key={familiar.id} className="p-4">
                <HStack className="justify-between items-start mb-3">
                  <HStack className="items-center flex-1" space="sm">
                    <Avatar size="md" className="bg-blue-400/20">
                      {familiar.picture ? (
                        <AvatarImage source={{ uri: familiar.picture }} />
                      ) : (
                        <AvatarFallbackText className="text-blue-500">
                          {familiar.nome.charAt(0)}
                        </AvatarFallbackText>
                      )}
                    </Avatar>
                    <VStack className="flex-1">
                      <Text className="font-medium text-gray-800">
                        {familiar.nome}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {familiar.parentesco}
                      </Text>
                      {familiar.age && (
                        <Text className="text-xs text-gray-500">
                          {familiar.age} anos
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  <VStack className="items-end">
                    <Badge
                      variant="solid"
                      action={familiar.status === "ativo" ? "success" : "warning"}
                      size="sm"
                      className="rounded-md"
                    >
                      <BadgeText>
                        {familiar.status === "ativo" ? "Ativo" : "Pendente"}
                      </BadgeText>
                    </Badge>
                  </VStack>
                </HStack>

                <VStack space="xs" className="mb-3">
                  <HStack className="items-center">
                    <Ionicons name="mail-outline" size={14} color="#9CA3AF" />
                    <Text className="text-xs text-gray-600 ml-2">
                      {familiar.email}
                    </Text>
                  </HStack>
                  <HStack className="items-center">
                    <Ionicons name="shield-checkmark-outline" size={14} color="#9CA3AF" />
                    <Text className="text-xs text-gray-600 ml-2">
                      {familiar.permissoes === 'view' ? 'Apenas visualização' : 'Visualização + Notificações'}
                    </Text>
                  </HStack>
                </VStack>

                <HStack space="xs">
                  <Button
                    size="xs"
                    variant="outline"
                    className="flex-1 bg-red-50 data-[hover=true]:bg-red-100 border-red-200"
                    onPress={() => handleRemoveFamiliar(familiar.id)}
                  >
                    <HStack className="items-center" space="xs">
                      <Ionicons name="trash-outline" size={12} color="#DC2626" />
                      <ButtonText className="text-red-700 text-xs">
                        Remover
                      </ButtonText>
                    </HStack>
                  </Button>
                </HStack>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>
    </ScrollView>
  )
}