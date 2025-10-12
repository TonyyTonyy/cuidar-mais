import React, { useEffect, useState } from "react"
import { ActivityIndicator, Alert, ScrollView, StatusBar, View } from "react-native"
import * as Speech from "expo-speech"
import { VStack } from "@/components/ui/vstack"
import { Box } from "@/components/ui/box"
import { Text } from "@/components/ui/text"
import { Input, InputField } from "@/components/ui/input"
import { Button, ButtonText } from "@/components/ui/button"
import { HStack } from "@/components/ui/hstack"
import { Textarea, TextareaInput } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from ".."
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

interface MedicineForm {
    name: string
    dosage: string
    frequency: "hours" | "times_day" | "specific_days"
    frequencyValue: number
    times: string[]
    days: string[]
    duration: "continuous" | "days"
    durationDays: number
    notes: string
}

interface ValidationError {
    field: string
    message: string
}

const initialForm: MedicineForm = {
    name: "",
    dosage: "",
    frequency: "times_day",
    frequencyValue: 1,
    times: [],
    days: [],
    duration: "continuous",
    durationDays: 0,
    notes: "",
}

const weekDays = [
    { key: "dom", label: "D" },
    { key: "seg", label: "S" },
    { key: "ter", label: "T" },
    { key: "qua", label: "Q" },
    { key: "qui", label: "Q" },
    { key: "sex", label: "S" },
    { key: "sab", label: "S" },
]

export default function MedicineScreen() {
    const [currentStep, setCurrentStep] = useState(0)
    const [form, setForm] = useState<MedicineForm>(initialForm)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<ValidationError[]>([])
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [canProceed, setCanProceed] = useState(false);

    useEffect(() => {
        const valid = validateCurrentStep();
        setCanProceed(valid);
    }, [form, currentStep]);

    const steps = ["Nome do Medicamento", "Dosagem", "Frequência", "Horários", "Duração", "Observações"]

    const clearFieldError = (field: string) => {
        setErrors(prev => prev.filter(error => error.field !== field))
    }

    const addFieldError = (field: string, message: string) => {
        setErrors(prev => [...prev.filter(error => error.field !== field), { field, message }])
    }

    const getFieldError = (field: string): string | undefined => {
        return errors.find(error => error.field === field)?.message
    }

    const validateMedicineName = (name: string): boolean => {
        if (!name.trim()) {
            addFieldError('name', 'Nome do medicamento é obrigatório')
            return false
        }
        if (name.trim().length < 2) {
            addFieldError('name', 'Nome deve ter pelo menos 2 caracteres')
            return false
        }
        if (name.trim().length > 100) {
            addFieldError('name', 'Nome não pode exceder 100 caracteres')
            return false
        }
        clearFieldError('name')
        return true
    }

    const validateDosage = (dosage: string): boolean => {
        if (!dosage.trim()) {
            addFieldError('dosage', 'Dosagem é obrigatória')
            return false
        }
        if (dosage.trim().length < 2) {
            addFieldError('dosage', 'Dosagem deve ter pelo menos 2 caracteres')
            return false
        }
        if (dosage.trim().length > 50) {
            addFieldError('dosage', 'Dosagem não pode exceder 50 caracteres')
            return false
        }
        clearFieldError('dosage')
        return true
    }

    const validateFrequency = (): boolean => {
        if (form.frequency === "hours") {
            if (!form.frequencyValue || form.frequencyValue < 1 || form.frequencyValue > 24) {
                addFieldError('frequency', 'Frequência deve ser entre 1 e 24 horas')
                return false
            }
        } else if (form.frequency === "specific_days") {
            if (form.days.length === 0) {
                addFieldError('frequency', 'Selecione pelo menos um dia da semana')
                return false
            }
        }
        clearFieldError('frequency')
        return true
    }

    const isValidTimeFormat = (time: string): boolean => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        return timeRegex.test(time)
    }

    const validateTimes = (): boolean => {
        if (form.frequency === "hours") {
            if (form.times.length === 0 || !form.times[0]) {
                addFieldError('times', 'Primeiro horário é obrigatório')
                return false
            }
            if (!isValidTimeFormat(form.times[0])) {
                addFieldError('times', 'Formato de horário inválido (use HH:MM)')
                return false
            }
        } else {
            if (form.times.length === 0) {
                addFieldError('times', 'Adicione pelo menos um horário')
                return false
            }

            for (let i = 0; i < form.times.length; i++) {
                if (!isValidTimeFormat(form.times[i])) {
                    addFieldError('times', `Horário ${i + 1} tem formato inválido (use HH:MM)`)
                    return false
                }
            }

            const uniqueTimes = new Set(form.times)
            if (uniqueTimes.size !== form.times.length) {
                addFieldError('times', 'Não é possível ter horários duplicados')
                return false
            }
        }
        clearFieldError('times')
        return true
    }

    const validateDuration = (): boolean => {
        if (form.duration === "days") {
            if (!form.durationDays || form.durationDays < 1 || form.durationDays > 365) {
                addFieldError('duration', 'Duração deve ser entre 1 e 365 dias')
                return false
            }
        }
        clearFieldError('duration')
        return true
    }

    const validateNotes = (): boolean => {
        if (form.notes.length > 500) {
            addFieldError('notes', 'Observações não podem exceder 500 caracteres')
            return false
        }
        clearFieldError('notes')
        return true
    }

    const validateCurrentStep = (): boolean => {
        switch (currentStep) {
            case 0:
                return validateMedicineName(form.name)
            case 1:
                return validateDosage(form.dosage)
            case 2:
                return validateFrequency()
            case 3:
                return validateTimes()
            case 4:
                return validateDuration()
            case 5:
                return validateNotes()
            default:
                return false
        }
    }

    const handleNext = () => {
        setErrors([])
        if (validateCurrentStep()) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
            setErrors([])
        }
    }

    const getStoredToken = async () => {
        try {
            const keysToTry = ['token', 'authToken', 'accessToken']
            for (const key of keysToTry) {
                const t = await AsyncStorage.getItem(key)
                if (t) return t
            }
            return null
        } catch (e) {
            return null
        }
    }

    const handleSubmit = async () => {
        // Valida todos os campos
        const isNameValid = validateMedicineName(form.name)
        const isDosageValid = validateDosage(form.dosage)
        const isFrequencyValid = validateFrequency()
        const areTimesValid = validateTimes()
        const isDurationValid = validateDuration()
        const areNotesValid = validateNotes()

        if (!isNameValid || !isDosageValid || !isFrequencyValid || !areTimesValid || !isDurationValid || !areNotesValid) {
            Alert.alert("Erro de Validação", "Por favor, corrija os erros antes de continuar")
            return
        }

        setIsSubmitting(true)

        try {
            const token = await getStoredToken()

            if (!token) {
                Alert.alert("Erro", "Você precisa estar logado para cadastrar medicamentos")
                setIsSubmitting(false)
                return
            }

            // Envia para o backend
            const response = await fetch(`${API_URL}/api/medications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: form.name.trim(),
                    dosage: form.dosage.trim(),
                    frequency: form.frequency,
                    frequencyValue: form.frequencyValue,
                    times: form.times,
                    days: form.days,
                    duration: form.duration,
                    durationDays: form.durationDays,
                    notes: form.notes.trim(),
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao cadastrar medicamento')
            }

            // Feedback de voz
            try {
                Speech.speak("Medicamento cadastrado com sucesso", {
                    language: "pt-BR",
                })
            } catch (error) {
                console.log("Speech not available:", error)
            }

            Alert.alert(
                "Sucesso",
                "Medicamento cadastrado com sucesso!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // Limpa o formulário
                            setForm(initialForm)
                            setCurrentStep(0)
                            // Navega para a home
                            navigation.navigate("Home")
                        },
                    },
                ]
            )
        } catch (error) {
            console.error("Erro ao salvar medicamento:", error)
            Alert.alert(
                "Erro",
                error instanceof Error ? error.message : "Ocorreu um erro ao salvar o medicamento. Tente novamente."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const addTime = () => {
        const newTime = "08:00"
        setForm((prev) => ({
            ...prev,
            times: [...prev.times, newTime],
        }))
        clearFieldError('times')
    }

    const updateTime = (index: number, time: string) => {
        setForm((prev) => ({
            ...prev,
            times: prev.times.map((t, i) => (i === index ? time : t)),
        }))
        clearFieldError('times')
    }

    const removeTime = (index: number) => {
        setForm((prev) => ({
            ...prev,
            times: prev.times.filter((_, i) => i !== index),
        }))
        clearFieldError('times')
    }

    const toggleDay = (day: string) => {
        setForm((prev) => ({
            ...prev,
            days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
        }))
        clearFieldError('frequency')
    }

    const ErrorMessage = ({ field }: { field: string }) => {
        const error = getFieldError(field)
        if (!error) return null

        return (
            <Text className="text-sm mt-1" style={{ color: "#FF6B6B" }}>
                {error}
            </Text>
        )
    }

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <VStack space="lg" className="p-6">
                        <VStack space="md" className="items-center mb-8">
                            <Box className="p-4">
                                <Ionicons name="medical" size={64} color="#4DA6FF" />
                            </Box>
                            <Text className="text-2xl font-bold text-center" style={{ color: "#333333" }}>
                                Nome do Medicamento
                            </Text>
                        </VStack>
                        <VStack space="sm">
                            <Text className="text-lg font-semibold">Digite o nome do medicamento</Text>
                            <Input className="h-14" style={{
                                borderColor: getFieldError('name') ? "#FF6B6B" : "#4DA6FF"
                            }}>
                                <InputField
                                    value={form.name}
                                    onChangeText={(text) => {
                                        setForm((prev) => ({ ...prev, name: text }))
                                        clearFieldError('name')
                                    }}
                                    placeholder="Ex: Losartana, Omeprazol..."
                                    className="text-lg"
                                    maxLength={100}
                                />
                            </Input>
                            <ErrorMessage field="name" />
                        </VStack>
                    </VStack>
                )

            case 1:
                return (
                    <VStack space="lg" className="p-6">
                        <VStack space="md" className="items-center mb-8">
                            <Box
                                className="w-16 h-16 rounded-full items-center justify-center"
                                style={{ backgroundColor: "#4DA6FF" }}
                            >
                                <Text className="text-white text-2xl font-bold">mg</Text>
                            </Box>
                            <Text className="text-2xl font-bold text-center" style={{ color: "#333333" }}>
                                Dosagem
                            </Text>
                        </VStack>
                        <VStack space="sm">
                            <Text className="text-lg font-semibold">Qual a dosagem?</Text>
                            <Input className="h-14" style={{
                                borderColor: getFieldError('dosage') ? "#FF6B6B" : "#4DA6FF"
                            }}>
                                <InputField
                                    value={form.dosage}
                                    onChangeText={(text) => {
                                        setForm((prev) => ({ ...prev, dosage: text }))
                                        clearFieldError('dosage')
                                    }}
                                    placeholder="Ex: 50mg, 10ml, 1 comprimido..."
                                    className="text-lg"
                                    maxLength={50}
                                />
                            </Input>
                            <ErrorMessage field="dosage" />
                        </VStack>
                    </VStack>
                )

            case 2:
                return (
                    <VStack space="lg" className="p-6">
                        <VStack space="md" className="items-center mb-8">
                            <Ionicons name="time-outline" size={64} color="#4DA6FF" />
                            <Text className="text-2xl font-bold text-center" style={{ color: "#333333" }}>
                                Frequência
                            </Text>
                        </VStack>
                        <VStack space="sm">
                            <Text className="text-lg font-semibold">Com que frequência?</Text>

                            <VStack space="sm">
                                <Button
                                    className="w-full h-14 justify-start"
                                    variant={form.frequency === "hours" ? "solid" : "outline"}
                                    onPress={() => {
                                        setForm((prev) => ({ ...prev, frequency: "hours", frequencyValue: 8 }))
                                        clearFieldError('frequency')
                                    }}
                                    style={{
                                        backgroundColor: form.frequency === "hours" ? "#4DA6FF" : "transparent",
                                        borderColor: getFieldError('frequency') ? "#FF6B6B" : "#4DA6FF",
                                    }}
                                >
                                    <ButtonText
                                        className="text-lg"
                                        style={{ color: form.frequency === "hours" ? "white" : "#4DA6FF" }}
                                    >
                                        A cada X horas
                                    </ButtonText>
                                </Button>

                                {form.frequency === "hours" && (
                                    <HStack space="sm" className="ml-4 items-center">
                                        <Input className="w-24 h-12" style={{
                                            borderColor: getFieldError('frequency') ? "#FF6B6B" : "#4DA6FF"
                                        }}>
                                            <InputField
                                                value={form.frequencyValue.toString()}
                                                onChangeText={(text) => {
                                                    const value = parseInt(text) || 1
                                                    if (value >= 1 && value <= 24) {
                                                        setForm((prev) => ({ ...prev, frequencyValue: value }))
                                                        clearFieldError('frequency')
                                                    }
                                                }}
                                                keyboardType="numeric"
                                                className="text-center"
                                                maxLength={2}
                                            />
                                        </Input>
                                        <Text className="text-lg">horas</Text>
                                    </HStack>
                                )}

                                <Button
                                    className="w-full h-14 justify-start"
                                    variant={form.frequency === "times_day" ? "solid" : "outline"}
                                    onPress={() => {
                                        setForm((prev) => ({ ...prev, frequency: "times_day" }))
                                        clearFieldError('frequency')
                                    }}
                                    style={{
                                        backgroundColor: form.frequency === "times_day" ? "#4DA6FF" : "transparent",
                                        borderColor: "#4DA6FF",
                                    }}
                                >
                                    <ButtonText
                                        className="text-lg"
                                        style={{ color: form.frequency === "times_day" ? "white" : "#4DA6FF" }}
                                    >
                                        X vezes ao dia
                                    </ButtonText>
                                </Button>

                                <Button
                                    className="w-full h-14 justify-start"
                                    variant={form.frequency === "specific_days" ? "solid" : "outline"}
                                    onPress={() => {
                                        setForm((prev) => ({ ...prev, frequency: "specific_days" }))
                                        clearFieldError('frequency')
                                    }}
                                    style={{
                                        backgroundColor: form.frequency === "specific_days" ? "#4DA6FF" : "transparent",
                                        borderColor: getFieldError('frequency') ? "#FF6B6B" : "#4DA6FF",
                                    }}
                                >
                                    <ButtonText
                                        className="text-lg"
                                        style={{ color: form.frequency === "specific_days" ? "white" : "#4DA6FF" }}
                                    >
                                        Dias específicos da semana
                                    </ButtonText>
                                </Button>

                                {form.frequency === "specific_days" && (
                                    <HStack space="sm" className="ml-4 flex-wrap">
                                        {weekDays.map((day) => (
                                            <Button
                                                key={day.key}
                                                className="w-12 h-12"
                                                variant={form.days.includes(day.key) ? "solid" : "outline"}
                                                onPress={() => toggleDay(day.key)}
                                                style={{
                                                    backgroundColor: form.days.includes(day.key) ? "#4DA6FF" : "transparent",
                                                    borderColor: getFieldError('frequency') ? "#FF6B6B" : "#4DA6FF",
                                                }}
                                            >
                                                <ButtonText
                                                    style={{ color: form.days.includes(day.key) ? "white" : "#4DA6FF" }}
                                                >
                                                    {day.label}
                                                </ButtonText>
                                            </Button>
                                        ))}
                                    </HStack>
                                )}
                            </VStack>
                            <ErrorMessage field="frequency" />
                        </VStack>
                    </VStack>
                )

            case 3:
                return (
                    <VStack space="lg" className="p-6">
                        <VStack space="md" className="items-center mb-8">
                            <Ionicons name="time-outline" size={64} color="#4DA6FF" />
                            <Text className="text-2xl font-bold text-center" style={{ color: "#333333" }}>
                                Horários
                            </Text>
                        </VStack>

                        {form.frequency === "hours" ? (
                            <VStack space="md" className="items-center">
                                <Text className="text-lg text-gray-600 text-center">
                                    Os horários serão calculados automaticamente a cada {form.frequencyValue} horas
                                </Text>
                                <VStack space="sm">
                                    <Text className="text-lg font-semibold">Primeiro horário:</Text>
                                    <Input className="h-14" style={{
                                        borderColor: getFieldError('times') ? "#FF6B6B" : "#4DA6FF"
                                    }}>
                                        <InputField
                                            value={form.times[0] || "08:00"}
                                            onChangeText={(text) => {
                                                setForm((prev) => ({ ...prev, times: [text] }))
                                                clearFieldError('times')
                                            }}
                                            placeholder="08:00"
                                            className="text-lg text-center"
                                            maxLength={5}
                                        />
                                    </Input>
                                    <ErrorMessage field="times" />
                                </VStack>
                            </VStack>
                        ) : (
                            <VStack space="sm">
                                <Text className="text-lg font-semibold">Adicione os horários:</Text>

                                {form.times.map((time, index) => (
                                    <HStack key={index} space="sm" className="items-center">
                                        <Input className="flex-1 h-12" style={{
                                            borderColor: getFieldError('times') ? "#FF6B6B" : "#4DA6FF"
                                        }}>
                                            <InputField
                                                value={time}
                                                onChangeText={(text) => updateTime(index, text)}
                                                placeholder="08:00"
                                                className="text-lg text-center"
                                                maxLength={5}
                                            />
                                        </Input>
                                        <Button
                                            className="p-0 h-12 w-12 text-red-500 bg-transparent border border-red-500"
                                            onPress={() => removeTime(index)}
                                            style={{ borderColor: "#FF6B6B" }}
                                        >
                                            <Ionicons name="close" size={20} color="#FF6B6B" />
                                        </Button>
                                    </HStack>
                                ))}

                                <Button
                                    className="w-full h-12"
                                    variant="outline"
                                    onPress={addTime}
                                    style={{ borderColor: "#5FD068" }}
                                    isDisabled={form.times.length >= 10}
                                >
                                    <ButtonText className="text-lg" style={{ color: "#5FD068" }}>
                                        + Adicionar Horário {form.times.length >= 10 ? "(Máximo 10)" : ""}
                                    </ButtonText>
                                </Button>
                                <ErrorMessage field="times" />
                            </VStack>
                        )}
                    </VStack>
                )

            case 4:
                return (
                    <VStack space="lg" className="p-6">
                        <VStack space="md" className="items-center mb-8">
                            <Ionicons name="calendar-outline" size={64} color="#4DA6FF" />
                            <Text className="text-2xl font-bold text-center" style={{ color: "#333333" }}>
                                Duração do Tratamento
                            </Text>
                        </VStack>
                        <VStack space="sm">
                            <Text className="text-lg font-semibold">Por quanto tempo?</Text>

                            <VStack space="sm">
                                <Button
                                    className="w-full h-14 justify-start"
                                    variant={form.duration === "continuous" ? "solid" : "outline"}
                                    onPress={() => {
                                        setForm((prev) => ({ ...prev, duration: "continuous" }))
                                        clearFieldError('duration')
                                    }}
                                    style={{
                                        backgroundColor: form.duration === "continuous" ? "#4DA6FF" : "transparent",
                                        borderColor: "#4DA6FF",
                                    }}
                                >
                                    <ButtonText
                                        className="text-lg"
                                        style={{ color: form.duration === "continuous" ? "white" : "#4DA6FF" }}
                                    >
                                        Uso contínuo
                                    </ButtonText>
                                </Button>

                                <Button
                                    className="w-full h-14 justify-start"
                                    variant={form.duration === "days" ? "solid" : "outline"}
                                    onPress={() => {
                                        setForm((prev) => ({ ...prev, duration: "days", durationDays: 30 }))
                                        clearFieldError('duration')
                                    }}
                                    style={{
                                        backgroundColor: form.duration === "days" ? "#4DA6FF" : "transparent",
                                        borderColor: getFieldError('duration') ? "#FF6B6B" : "#4DA6FF",
                                    }}
                                >
                                    <ButtonText
                                        className="text-lg"
                                        style={{ color: form.duration === "days" ? "white" : "#4DA6FF" }}
                                    >
                                        Durante X dias
                                    </ButtonText>
                                </Button>

                                {form.duration === "days" && (
                                    <HStack space="sm" className="ml-4 items-center">
                                        <Input className="w-24 h-12" style={{
                                            borderColor: getFieldError('duration') ? "#FF6B6B" : "#4DA6FF"
                                        }}>
                                            <InputField
                                                value={form.durationDays.toString()}
                                                onChangeText={(text) => {
                                                    const value = parseInt(text) || 0
                                                    if (value >= 0 && value <= 365) {
                                                        setForm((prev) => ({ ...prev, durationDays: value }))
                                                        clearFieldError('duration')
                                                    }
                                                }}
                                                keyboardType="numeric"
                                                placeholder="30"
                                                className="text-center"
                                                maxLength={3}
                                            />
                                        </Input>
                                        <Text className="text-lg">dias</Text>
                                    </HStack>
                                )}
                            </VStack>
                            <ErrorMessage field="duration" />
                        </VStack>
                    </VStack>
                )

            case 5:
                return (
                    <VStack space="lg" className="p-6">
                        <VStack space="md" className="items-center mb-8">
                            <Ionicons name="document-text-outline" size={64} color="#4DA6FF" />
                            <Text className="text-2xl font-bold text-center" style={{ color: "#333333" }}>
                                Observações
                            </Text>
                        </VStack>
                        <VStack space="sm">
                            <Text className="text-lg font-semibold">
                                Alguma observação especial? (opcional)
                            </Text>
                            <Textarea className="min-h-32" style={{
                                borderColor: getFieldError('notes') ? "#FF6B6B" : "#4DA6FF"
                            }}>
                                <TextareaInput
                                    value={form.notes}
                                    onChangeText={(text) => {
                                        if (text.length <= 500) {
                                            setForm((prev) => ({ ...prev, notes: text }))
                                            clearFieldError('notes')
                                        }
                                    }}
                                    placeholder="Ex: Tomar após as refeições, com bastante água..."
                                    className="text-lg"
                                    maxLength={500}
                                />
                            </Textarea>
                            <Text className="text-xs text-gray-500 text-right">
                                {form.notes.length}/500 caracteres
                            </Text>
                            <ErrorMessage field="notes" />
                        </VStack>
                    </VStack>
                )

            default:
                return null
        }
    }

    return (
        <View className="flex-1 w-full max-w-lg self-center p-4">
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
            <Box className="p-4 border-b-2 border-[#cdcdcd] bg-white" style={{ elevation: 3 }}>
                <HStack className="items-center justify-between">
                    <Text className="text-xl font-bold" style={{ color: "#333333" }}>
                        Adicionar Medicamento
                    </Text>
                    <Box className="w-12" />
                </HStack>

                <VStack space="xs" className="mt-4">
                    <HStack className="justify-between">
                        <Text className="text-sm text-gray-500">
                            Passo {currentStep + 1} de {steps.length}
                        </Text>
                        <Text className="text-sm text-gray-500">
                            {Math.round(((currentStep + 1) / steps.length) * 100)}%
                        </Text>
                    </HStack>
                    <Box className="w-full bg-gray-200 rounded-full h-2">
                        <Box
                            className="h-2 rounded-full"
                            style={{
                                backgroundColor: "#4DA6FF",
                                width: `${((currentStep + 1) / steps.length) * 100}%`,
                            }}
                        />
                    </Box>
                </VStack>
            </Box>

            <ScrollView className="flex-1">
                <Box className="py-6 items-center justify-center">
                    <Card className="p-0 w-full bg-white" style={{ elevation: 3 }}>
                        {renderStep()}
                    </Card>
                </Box>
            </ScrollView>

            <View className="p-4 bg-white rounded-md" style={{ elevation: 3 }}>
                <HStack space="md">
                    {currentStep > 0 && (
                        <Button
                            className="flex-1 h-14 max-w-[130px]"
                            variant="outline"
                            onPress={handlePrevious}
                            style={{ borderColor: "#4DA6FF" }}
                        >
                            <Ionicons name="arrow-back" size={20} color="#4DA6FF" />
                            <ButtonText className="ml-2 text-lg" style={{ color: "#4DA6FF" }}>
                                Voltar
                            </ButtonText>
                        </Button>
                    )}

                    {currentStep < steps.length - 1 ? (
                        <Button
                            className="flex-1 h-14"
                            variant="solid"
                            onPress={handleNext}
                            isDisabled={!canProceed}
                            style={{ backgroundColor: canProceed ? "#4DA6FF" : "#ccc" }}
                        >
                            <ButtonText className="text-lg text-white">Próximo</ButtonText>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                        </Button>
                    ) : (
                        <Button
                            className="flex-1 h-14 bg-emerald-500"
                            variant="solid"
                            onPress={handleSubmit}
                            isDisabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <ActivityIndicator size="small" color="white" />
                                    <ButtonText className="ml-2 text-lg text-white">Salvando...</ButtonText>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="checkmark" size={20} color="white" />
                                    <ButtonText className="ml-2 text-base text-white">Salvar Medicamento</ButtonText>
                                </>
                            )}
                        </Button>
                    )}
                </HStack>
            </View>
        </View>
    )
}