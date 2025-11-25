import React, { useState, useEffect } from 'react'
import { View, Text, Modal, Pressable, Dimensions, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Svg, { Defs, Mask, Rect, Circle } from 'react-native-svg'

const { width, height } = Dimensions.get('window')

interface TutorialStep {
    id: string
    title: string
    description: string
    spotlight: { x: number; y: number; width: number; height: number; radius?: number }
    tooltipPosition: 'top' | 'bottom' | 'middle'
    icon: keyof typeof Ionicons.glyphMap
    showIcon: boolean
}

interface TutorialOverlayProps {
    onComplete: () => void
}

const TUTORIAL_STORAGE_KEY = 'dashboard_tutorial_completed'

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [visible, setVisible] = useState(false)

    // Definir os passos do tutorial com posições aproximadas
    const tutorialSteps: TutorialStep[] = [
        {
            id: 'welcome',
            title: 'Bem-vindo ao CuidarMais! 👋',
            description: 'Vamos fazer um tour rápido para você conhecer todas as funcionalidades.',
            spotlight: { x: width / 2 - 100, y: height / 2 - 50, width: 200, height: 100, radius: 100 },
            tooltipPosition: 'bottom',
            icon: 'heart-circle',
            showIcon: true
        },
        {
            id: 'profile',
            title: 'Seu Perfil',
            description: 'Aqui você vê seu nome e foto. Toque no ícone de engrenagem para configurações.',
            spotlight: { x: 16, y: 70, width: width - 90, height: 80, radius: 16 },
            tooltipPosition: 'bottom',
            icon: 'person-circle',
            showIcon: true
        },
        {
            id: 'stats',
            title: 'Suas Estatísticas',
            description: 'Acompanhe sua sequência de dias, medicamentos tomados hoje e seu progresso.',
            spotlight: { x: 16, y: 135, width: width - 32, height: 90, radius: 16 },
            tooltipPosition: 'bottom',
            icon: 'stats-chart',
            showIcon: true
        },
        {
            id: 'next-medicine',
            title: 'Próximo Medicamento',
            description: 'Este card mostra qual medicamento tomar. Toque no botão verde para confirmar.',
            spotlight: { x: 16, y: 240, width: width - 32, height: 320, radius: 24 },
            tooltipPosition: 'top',
            icon: 'alarm',
            showIcon: false
        },
        {
            id: 'medicine-list',
            title: 'Lista de Medicamentos',
            description: 'Aqui estão todos os seus medicamentos do dia. Os já tomados têm um ✅.',
            spotlight: { x: 16, y: 600, width: width - 32, height: 150, radius: 16 },
            tooltipPosition: 'top',
            icon: 'list',
            showIcon: false
        },
        {
            id: 'complete',
            title: 'Tudo Pronto! 🎉',
            description: 'Agora você está pronto! Lembre-se de confirmar seus medicamentos no horário.',
            spotlight: { x: width / 2 - 100, y: height / 2 - 50, width: 200, height: 100, radius: 100 },
            tooltipPosition: 'bottom',
            icon: 'checkmark-circle',
            showIcon: true
        }
    ]

    useEffect(() => {
        checkTutorialStatus()
    }, [])

    const checkTutorialStatus = async () => {
        try {
            const completed = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY)
            if (!completed) {
                setTimeout(() => setVisible(true), 800)
            }
        } catch (error) {
            console.error('Erro ao verificar status do tutorial:', error)
        }
    }

    const handleNext = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            completeTutorial()
        }
    }

    const handleSkip = () => {
        completeTutorial()
    }

    const completeTutorial = async () => {
        try {
            await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true')
            setVisible(false)
            onComplete()
        } catch (error) {
            console.error('Erro ao salvar status do tutorial:', error)
        }
    }

    if (!visible) return null

    const step = tutorialSteps[currentStep]
    const isLastStep = currentStep === tutorialSteps.length - 1

    // Calcular posição do tooltip
    const getTooltipStyle = () => {
        const baseStyle = {
            position: 'absolute' as const,
            left: 20,
            right: 20,
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 12,
        }

        if (step.tooltipPosition === 'top') {
            return { ...baseStyle, top: 30 }
        } else if (step.tooltipPosition === 'middle') {
            return { ...baseStyle, top: height / 2 - 150 }
        } else {
            return { ...baseStyle, bottom: 40 }
        }
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={{ flex: 1 }}>
                {/* SVG com máscara para criar o efeito de spotlight */}
                <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
                    <Defs>
                        <Mask id="mask">
                            {/* Fundo branco (área visível depois da máscara) */}
                            <Rect x="0" y="0" width={width} height={height} fill="white" />

                            {/* Área do spotlight (recorte preto = transparente) */}
                            <Rect
                                x={step.spotlight.x - 4}
                                y={step.spotlight.y - 4}
                                width={step.spotlight.width + 8}
                                height={step.spotlight.height + 8}
                                rx={step.spotlight.radius || 16}
                                fill="black"
                            />
                        </Mask>
                    </Defs>

                    {/* Overlay escuro com a máscara aplicada */}
                    <Rect
                        x="0"
                        y="0"
                        width={width}
                        height={height}
                        fill="rgba(0, 0, 0, 0.88)"
                        mask="url(#mask)"
                    />
                </Svg>

                {/* Borda brilhante ao redor da área destacada */}
                {step.id !== 'welcome' && step.id !== 'complete' && (
                    <View
                        style={{
                            position: 'absolute',
                            left: step.spotlight.x - 4,
                            top: step.spotlight.y - 4,
                            width: step.spotlight.width + 8,
                            height: step.spotlight.height + 8,
                            borderRadius: step.spotlight.radius || 16,
                            borderWidth: 4,
                            borderColor: '#3b82f6',
                            shadowColor: '#3b82f6',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 20,
                            elevation: 10,
                        }}
                        pointerEvents="none"
                    />
                )}

                {/* Seta apontando para o elemento (opcional, mas ajuda a guiar) */}
                {step.tooltipPosition === 'bottom' && step.id !== 'welcome' && step.id !== 'complete' && (
                    <View
                        style={{
                            position: 'absolute',
                            left: step.spotlight.x + step.spotlight.width / 2 - 15,
                            top: step.spotlight.y + step.spotlight.height + 10,
                            width: 0,
                            height: 0,
                            borderLeftWidth: 15,
                            borderRightWidth: 15,
                            borderTopWidth: 20,
                            borderLeftColor: 'transparent',
                            borderRightColor: 'transparent',
                            borderTopColor: '#3b82f6',
                        }}
                    />
                )}

                {step.tooltipPosition === 'top' && step.id !== 'welcome' && step.id !== 'complete' && (
                    <View
                        style={{
                            position: 'absolute',
                            left: step.spotlight.x + step.spotlight.width / 2 - 15,
                            top: step.spotlight.y - 30,
                            width: 0,
                            height: 0,
                            borderLeftWidth: 15,
                            borderRightWidth: 15,
                            borderBottomWidth: 20,
                            borderLeftColor: 'transparent',
                            borderRightColor: 'transparent',
                            borderBottomColor: '#3b82f6',
                        }}
                    />
                )}

                {/* Card de explicação */}
                <View style={getTooltipStyle()}>
                    {/* Ícone */}
                    {step.showIcon && (
                        <View
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: 36,
                                backgroundColor: '#3b82f6',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16,
                                alignSelf: 'center',
                            }}
                        >
                            <Ionicons name={step.icon} size={36} color="white" />
                        </View>
                    )}


                    {/* Título */}
                    <Text
                        style={{
                            fontSize: 26,
                            fontWeight: 'bold',
                            color: '#1e293b',
                            marginBottom: 12,
                            textAlign: 'center',
                        }}
                    >
                        {step.title}
                    </Text>

                    {/* Descrição */}
                    <Text
                        style={{
                            fontSize: 18,
                            color: '#64748b',
                            lineHeight: 28,
                            textAlign: 'center',
                            marginBottom: 24,
                        }}
                    >
                        {step.description}
                    </Text>

                    {/* Indicador de progresso */}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            marginBottom: 20,
                            gap: 8,
                        }}
                    >
                        {tutorialSteps.map((_, index) => (
                            <View
                                key={index}
                                style={{
                                    width: index === currentStep ? 24 : 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: index === currentStep ? '#3b82f6' : '#cbd5e1',
                                }}
                            />
                        ))}
                    </View>

                    {/* Botões */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        {!isLastStep && (
                            <Pressable
                                onPress={handleSkip}
                                style={({ pressed }) => ({
                                    flex: 1,
                                    paddingVertical: 18,
                                    paddingHorizontal: 24,
                                    borderRadius: 16,
                                    backgroundColor: pressed ? '#e2e8f0' : '#f1f5f9',
                                    alignItems: 'center',
                                })}
                            >
                                <Text style={{ fontSize: 18, fontWeight: '600', color: '#64748b' }}>
                                    Pular
                                </Text>
                            </Pressable>
                        )}

                        <Pressable
                            onPress={handleNext}
                            style={({ pressed }) => ({
                                flex: isLastStep ? 1 : 1,
                                paddingVertical: 18,
                                paddingHorizontal: 24,
                                borderRadius: 16,
                                backgroundColor: pressed ? '#2563eb' : '#3b82f6',
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                gap: 8,
                            })}
                        >
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                                {isLastStep ? 'Começar! 🚀' : 'Próximo'}
                            </Text>
                            {!isLastStep && <Ionicons name="arrow-forward" size={22} color="white" />}
                        </Pressable>
                    </View>
                </View>

                {/* Texto do contador no canto superior */}
                <View
                    style={{
                        position: 'absolute',
                        top: 50,
                        right: 20,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 5,
                    }}
                >
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#3b82f6' }}>
                        {currentStep + 1} de {tutorialSteps.length}
                    </Text>
                </View>
            </View>
        </Modal>
    )
}

// Hook auxiliar para resetar o tutorial
export const useResetTutorial = () => {
    const resetTutorial = async () => {
        try {
            await AsyncStorage.removeItem(TUTORIAL_STORAGE_KEY)
            console.log('Tutorial resetado com sucesso')
        } catch (error) {
            console.error('Erro ao resetar tutorial:', error)
        }
    }

    return { resetTutorial }
}