import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Medicine } from "@/src/types/medicine"
import React, { useState } from "react"
import { View, Text, ScrollView, Modal, Pressable, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Speech from "expo-speech"
import { SafeAreaView } from "react-native-safe-area-context"

const mockUser = {
  name: "Carlos",
  greeting: "Bom dia",
}

const mockMedicines: Medicine[] = [
  { id: 1, name: "Losartana", dosage: "50mg - 1 comprimido", time: "09:00", nextIn: 30, notes: "Após o café", status: "pending" },
  { id: 2, name: "Metformina", dosage: "850mg - 1 comprimido", time: "12:00", nextIn: 210, notes: "Antes do almoço", status: "pending" },
  { id: 3, name: "Omeprazol", dosage: "20mg - 1 cápsula", time: "07:30", nextIn: -30, notes: "Em jejum", status: "overdue" },
  { id: 4, name: "Vitamina D", dosage: "2000 UI - 1 cápsula", time: "08:00", nextIn: 0, notes: "Com o café da manhã", status: "taken" },
]

export default function DashboardScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<"home" | "medicines" | "family">("home")

  const nextMedicine = medicines.find((m) => m.status === "pending" && m.nextIn >= 0) || medicines[0]

  const handleTakeMedicine = (medicineId: number) => {
    try {
      const text = "Medicamento confirmado"
      if (Platform.OS !== "web") {
        Speech.speak(text, { language: "pt-BR" })
      } else if ("speechSynthesis" in global) {
        const utterance = new (global as any).SpeechSynthesisUtterance(text)
        utterance.lang = "pt-BR"
        ;(global as any).speechSynthesis.speak(utterance)
      }
    } catch (e) {
      // ignore
    }

    setMedicines((prev) => prev.map((med) => (med.id === medicineId ? { ...med, status: "taken" } : med)))
  }

  const formatTimeUntil = (minutes: number) => {
    if (minutes < 0) return "Atrasado"
    if (minutes === 0) return "Agora"
    if (minutes < 60) return `${minutes} minutos`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "taken":
        return "#5FD068"
      case "overdue":
        return "#FF6B6B"
      default:
        return "#333333"
    }
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <View className="p-4 border-b bg-white w-full max-w-md">
        <View className="flex-row items-center justify-between">
          <Text className="text-[22px] font-bold text-[#333]">
            {mockUser.greeting}, {mockUser.name}!
          </Text>

          <Pressable onPress={() => setShowSettings((s) => !s)} className="h-12 w-12 items-center justify-center">
            <Ionicons name="settings-outline" size={22} color="#4DA6FF" />
          </Pressable>
        </View>
      </View>

      <Modal visible={showSettings} animationType="fade" transparent>
        <View className="flex-1 items-center justify-center p-4 bg-black/50">
          <View className="w-full max-w-md p-6 rounded-xl bg-white">
            <Text className="text-lg font-bold mb-3 text-[#333]">Configurações</Text>

            <View className="space-y-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-base">Tamanho da fonte</Text>
                <View className="border border-[#4DA6FF] rounded-md overflow-hidden">
                  <Text className="p-2">Normal</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-base">Som</Text>
                <Pressable className="h-5 w-10 rounded bg-gray-200 items-center justify-center">
                  <Text>On</Text>
                </Pressable>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-base">Leitura por voz</Text>
                <Pressable className="h-5 w-10 rounded bg-gray-200 items-center justify-center">
                  <Text>Off</Text>
                </Pressable>
              </View>
            </View>

            <View className="mt-6">
              <Button onPress={() => setShowSettings(false)} className="bg-[#4DA6FF] p-3 rounded-lg">
                <Text className="text-white text-center font-bold">Fechar</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="p-4 w-full max-w-md">
        <Card className="p-4 mb-4 bg-gray-100 rounded-xl">
          <View className="items-center mb-4">
            <Text className="text-base font-semibold text-[#333]">Próximo remédio em...</Text>
            <Text className="text-2xl font-bold text-[#4DA6FF] mt-2">{formatTimeUntil(nextMedicine.nextIn)}</Text>
          </View>

          <View className="space-y-2">
            <Text className="text-xl font-bold text-center text-[#333]">{nextMedicine.name}</Text>
            <Text className="text-base text-center text-gray-600">{nextMedicine.dosage}</Text>
            <Text className="text-sm text-center text-gray-500">
              {nextMedicine.notes} • às {nextMedicine.time}
            </Text>
          </View>

          {nextMedicine.status === "pending" && (
            <View className="mt-4">
              <Button onPress={() => handleTakeMedicine(nextMedicine.id)} className="bg-[#5FD068] p-3 rounded-lg">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={18} color="white" />
                  <Text className="text-white font-bold ml-2">Tomar Agora</Text>
                </View>
              </Button>
            </View>
          )}
        </Card>

        <View>
          <Text className="text-lg font-bold text-[#333] mb-2">Lembretes de Hoje</Text>

          {medicines
            .slice()
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((medicine) => (
              <Card key={medicine.id} className="p-3 mb-2 rounded-lg">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center space-x-2 mb-1">
                      <Text style={{ fontSize: 16, fontWeight: "700", color: getStatusColor(medicine.status) }}>
                        {medicine.name}
                      </Text>
                      {medicine.status === "taken" && <Ionicons name="checkmark-circle" size={18} color="#5FD068" />}
                      {medicine.status === "overdue" && <Ionicons name="alert-circle" size={18} color="#FF6B6B" />}
                    </View>
                    <Text className="text-gray-600">{medicine.dosage}</Text>
                    <Text className="text-gray-500 text-xs">{medicine.notes}</Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-base font-bold text-[#333]">{medicine.time}</Text>
                    <Badge
                      className={`mt-1 px-2 py-1 rounded-md ${
                        medicine.status === "taken"
                          ? "bg-[#5FD068]"
                          : medicine.status === "overdue"
                          ? "bg-[#FF6B6B]"
                          : "bg-[#4DA6FF]"
                      }`}
                    >
                      <Text className="text-white text-xs">
                        {medicine.status === "taken"
                          ? "Tomado"
                          : medicine.status === "overdue"
                          ? "Atrasado"
                          : "Pendente"}
                      </Text>
                    </Badge>
                  </View>
                </View>
              </Card>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
