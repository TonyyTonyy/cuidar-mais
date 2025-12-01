// components/EditMedicineModal.tsx
import React, { useState, useEffect } from "react"
import { View, Text, Modal, Pressable, TextInput, ScrollView, Switch, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Button } from "@/components/ui/button"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getStoredToken } from "@/src/lib/get-stored-token"

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

interface EditMedicineModalProps {
  visible: boolean
  medicationId: string | null // ID real do medicamento no banco
  onClose: () => void
  onUpdate: () => void // Apenas recarrega os dados
  onDelete: () => void
}

const COLORS = [
  { value: '#6366F1', name: 'Índigo' },
  { value: '#3B82F6', name: 'Azul' },
  { value: '#10B981', name: 'Verde' },
  { value: '#F59E0B', name: 'Laranja' },
  { value: '#EF4444', name: 'Vermelho' },
  { value: '#8B5CF6', name: 'Roxo' },
]

export function EditMedicineModal({
  visible,
  medicationId,
  onClose,
  onUpdate,
  onDelete
}: EditMedicineModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    color: '#6366F1',
    active: true
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Busca dados completos do medicamento quando o modal abre
  useEffect(() => {
    if (visible && medicationId) {
      fetchMedicationData()
    }
  }, [visible, medicationId])

  const fetchMedicationData = async () => {
    setLoadingData(true)
    try {
      const token = await getStoredToken()

      if (!token) {
        return
      }

      const response = await fetch(`${API_URL}/api/medicines/${medicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const medication = data.medication

        setFormData({
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency,
          instructions: medication.instructions || '',
          color: medication.color,
          active: medication.active
        })
      }
    } catch (error) {
      console.error('Erro ao buscar medicamento:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSave = async () => {
    if (!medicationId) return

    setLoading(true)
    try {
      const token = await getStoredToken()

      if (!token) {
        return
      }

      const response = await fetch(`${API_URL}/api/medicines/${medicationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onUpdate() // Recarrega os dados no dashboard
        onClose()
      } else {
        console.error('Erro ao atualizar medicamento')
      }
    } catch (error) {
      console.error('Erro ao atualizar medicamento:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!medicationId) return

    setLoading(true)
    try {
      const token = await getStoredToken()

      if (!token) {
        return
      }

      const response = await fetch(`${API_URL}/api/medicines/${medicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        onDelete() // Recarrega os dados no dashboard
        setShowDeleteConfirm(false)
        onClose()
      }
    } catch (error) {
      console.error('Erro ao deletar medicamento:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!medicationId) return null

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <View>
              <Text className="text-2xl font-bold text-gray-900">Editar Medicamento</Text>
              <Text className="text-sm text-gray-500 mt-1">Atualize as informações</Text>
            </View>
            <Pressable
              onPress={onClose}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#1f2937" />
            </Pressable>
          </View>

          {loadingData ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-600 mt-4">Carregando dados...</Text>
            </View>
          ) : (
            <ScrollView
              className="px-6 py-4"
              showsVerticalScrollIndicator={false}
            >
              {/* Nome */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Nome do medicamento</Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Ex: Paracetamol"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                />
              </View>

              {/* Dosagem */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Dosagem</Text>
                <TextInput
                  value={formData.dosage}
                  onChangeText={(text) => setFormData({ ...formData, dosage: text })}
                  placeholder="Ex: 500mg"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                />
              </View>

              {/* Frequência */}
              <View className="mb-4 hidden">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Frequência</Text>
                <TextInput
                  value={formData.frequency}
                  onChangeText={(text) => setFormData({ ...formData, frequency: text })}
                  placeholder="Ex: A cada 8 horas"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                />
              </View>

              {/* Instruções */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Instruções (opcional)</Text>
                <TextInput
                  value={formData.instructions}
                  onChangeText={(text) => setFormData({ ...formData, instructions: text })}
                  placeholder="Ex: Tomar após as refeições"
                  multiline
                  numberOfLines={3}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  textAlignVertical="top"
                />
              </View>

              {/* Cor */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Cor do medicamento</Text>
                <View className="flex-row flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <Pressable
                      key={color.value}
                      onPress={() => setFormData({ ...formData, color: color.value })}
                      className={`w-14 h-14 rounded-2xl items-center justify-center ${formData.color === color.value ? 'ring-4 ring-blue-500' : ''
                        }`}
                      style={{ backgroundColor: color.value }}
                    >
                      {formData.color === color.value && (
                        <Ionicons name="checkmark" size={24} color="white" />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Status Ativo/Inativo */}
              <View className="mb-6">
                <View className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-4">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-700">Medicamento ativo</Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      Desative para arquivar sem deletar
                    </Text>
                  </View>
                  <Switch
                    value={formData.active}
                    onValueChange={(value) => setFormData({ ...formData, active: value })}
                    thumbColor={formData.active ? '#ffffff' : '#f4f4f5'}
                  />
                </View>
              </View>

              {/* Botões de ação */}
              <View className="space-y-3 mb-6">
                <Button
                  onPress={handleSave}
                  disabled={loading}
                  className="bg-blue-500 h-14 rounded-2xl shadow-lg hover:bg-blue-600 data-[hover=true]:bg-blue-600"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={20} color="white" />
                      <Text className="text-white font-bold text-lg ml-2">Salvar Alterações</Text>
                    </>
                  )}
                </Button>

                <Button
                  onPress={() => setShowDeleteConfirm(true)}
                  className="bg-red-50 h-14 rounded-2xl border border-red-200 data-[hover=true]:border-red-300 hover:bg-red-100 data-[hover=true]:bg-red-200"
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  <Text className="text-red-500 font-bold text-lg ml-2">Apagar Medicamento</Text>
                </Button>
              </View>
            </ScrollView>
          )}
        </View>

        {/* Confirmação de Delete */}
        {showDeleteConfirm && (
          <View className="absolute inset-0 bg-black/70 items-center justify-center px-6">
            <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
              <View className="items-center mb-4">
                <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="warning" size={32} color="#EF4444" />
                </View>
                <Text className="text-xl font-bold text-gray-900 text-center">
                  Apagar Medicamento?
                </Text>
                <Text className="text-gray-600 text-center mt-2">
                  O medicamento será desativado e não aparecerá mais na lista
                </Text>
              </View>

              <View className="space-y-2">
                <Button
                  onPress={handleDelete}
                  disabled={loading}
                  className="bg-red-500 h-12 rounded-xl hover:bg-red-600 data-[hover=true]:bg-red-700"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold">Confirmar</Text>
                  )}
                </Button>

                <Button
                  onPress={() => setShowDeleteConfirm(false)}
                  className="bg-gray-100 h-12 rounded-xl hover:bg-gray-200 data-[hover=true]:bg-gray-300"
                >
                  <Text className="text-gray-700 font-bold">Cancelar</Text>
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}