import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { HStack } from "@/components/ui/hstack"
import { Box } from "@/components/ui/box"
import { Ionicons } from '@expo/vector-icons';
import Inicio from './inicio';
import Familiares from './familiares';
import Historico from './historico';
import Relatorios from './relatorios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const FamilyScreen = () => {
    const [activeTab, setActiveTab] = useState('inicio');
    const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
    const [profiles, setProfiles] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [medicamentosHoje, setMedicamentosHoje] = useState<any[]>([]);
    const [familiares, setFamiliares] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newFamiliar, setNewFamiliar] = useState({
        email: '',
        parentesco: '',
        permissoes: 'view'
    });

    // Carregar familiares conectados
    const loadFamiliares = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/api/family`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFamiliares(data);

                // Criar objeto de profiles
                const profilesObj = data.reduce((acc: any, familiar: any) => {
                    acc[familiar.familiarId] = {
                        name: familiar.nome,
                        age: familiar.age || 0,
                        email: familiar.email
                    };
                    return acc;
                }, {});

                setProfiles(profilesObj);

                // Selecionar primeiro perfil se não houver seleção
                if (!selectedProfile && data.length > 0) {
                    setSelectedProfile(data[0].familiarId);
                }
            }
        } catch (error) {
            console.error('Error loading familiares:', error);
        }
    };

    // Carregar medicamentos do familiar selecionado
    const loadMedicamentosHoje = async () => {
        if (!selectedProfile) return;

        try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(
                `${API_URL}/api/family/${selectedProfile}/medications`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                const medications = await response.json();
                
                // Transformar medicamentos em formato de "hoje"
                const hoje = new Date();
                const medicamentosFormatados = medications.flatMap((med: any) => {
                    return med.reminders.map((reminder: any) => ({
                        id: `${med.id}-${reminder.id}`,
                        medicationId: med.id,
                        reminderId: reminder.id,
                        nome: med.name,
                        horario: reminder.time,
                        tipo: med.dosage,
                        tomado: false, // Será atualizado com logs
                        color: med.color
                    }));
                });

                // Buscar logs de hoje
                const logsResponse = await fetch(
                    `${API_URL}/api/family/${selectedProfile}/logs?days=1`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (logsResponse.ok) {
                    const logs = await logsResponse.json();
                    
                    // Atualizar status com base nos logs
                    medicamentosFormatados.forEach((med: any) => {
                        const log = logs.find((l: any) => 
                            l.medicationId === med.medicationId && 
                            l.scheduledTime === med.horario &&
                            new Date(l.takenAt).toDateString() === hoje.toDateString()
                        );
                        
                        if (log) {
                            med.tomado = log.status === 'taken';
                            med.status = log.status;
                        }
                    });
                }

                setMedicamentosHoje(medicamentosFormatados);
            }
        } catch (error) {
            console.error('Error loading medications:', error);
        }
    };

    // Adicionar familiar (enviar convite)
    const handleAddFamiliar = async () => {
        if (!newFamiliar.email) {
            Alert.alert('Erro', 'Por favor, preencha o email');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/api/family`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newFamiliar)
            });

            if (response.ok) {
                Alert.alert('Sucesso', 'Convite enviado com sucesso!');
                setShowAddForm(false);
                setNewFamiliar({ email: '', parentesco: '', permissoes: 'view' });
                loadFamiliares();
            } else {
                const error = await response.json();
                Alert.alert('Erro', error.error || 'Erro ao enviar convite');
            }
        } catch (error) {
            console.error('Error adding familiar:', error);
            Alert.alert('Erro', 'Erro ao enviar convite');
        }
    };

    // Remover familiar
    const handleRemoveFamiliar = async (id: string) => {
        Alert.alert(
            'Confirmar',
            'Deseja realmente remover esta conexão?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('authToken');
                            const response = await fetch(`${API_URL}/api/family/${id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });

                            if (response.ok) {
                                Alert.alert('Sucesso', 'Conexão removida');
                                loadFamiliares();
                            }
                        } catch (error) {
                            console.error('Error removing familiar:', error);
                            Alert.alert('Erro', 'Erro ao remover conexão');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (med: any) => {
        if (med.tomado || med.status === 'taken') return 'success';
        if (new Date().getHours() > parseInt(med.horario.split(':')[0])) return 'error';
        return 'muted';
    };

    const getStatusText = (med: any) => {
        if (med.tomado || med.status === 'taken') return 'Tomado';
        if (med.status === 'late') return 'Atrasado';
        if (med.status === 'skipped') return 'Pulado';
        if (new Date().getHours() > parseInt(med.horario.split(':')[0])) return 'Atrasado';
        return 'Pendente';
    };

    const getStatusIcon = (med: any) => {
        if (med.tomado || med.status === 'taken') return 'checkmark-circle';
        if (med.status === 'skipped') return 'close-circle';
        if (new Date().getHours() > parseInt(med.horario.split(':')[0])) return 'close-circle';
        return 'time-outline';
    };

    useEffect(() => {
        loadFamiliares();
    }, []);

    useEffect(() => {
        if (selectedProfile) {
            loadMedicamentosHoje();
        }
    }, [selectedProfile]);

    useEffect(() => {
        setLoading(false);
    }, [profiles]);

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#4DA6FF" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Box className="bg-white border-b border-gray-200">
                <HStack className="px-4 py-2">
                    {[
                        { id: 'inicio', label: 'Inicio', icon: 'person-outline' },
                        { id: 'familiares', label: 'Familiares', icon: 'people-outline' },
                        { id: 'historico', label: 'Histórico', icon: 'time-outline' },
                        { id: 'relatorios', label: 'Relatórios', icon: 'bar-chart-outline' }
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id)}
                            className={`flex-1 items-center py-2 px-1 rounded-lg ${
                                activeTab === tab.id ? 'bg-blue-100' : ''
                            }`}
                        >
                            <Ionicons
                                name={tab.icon as any}
                                size={16}
                                color={activeTab === tab.id ? '#2563EB' : '#6B7280'}
                            />
                            <Text
                                className={`text-xs mt-1 ${
                                    activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'
                                }`}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </HStack>
            </Box>

            <ScrollView className="flex-1">
                {activeTab === 'inicio' && (
                    <Inicio
                        profiles={profiles}
                        selectedProfile={selectedProfile}
                        setSelectedProfile={setSelectedProfile}
                        medicamentosHoje={medicamentosHoje}
                        setActiveTab={setActiveTab}
                        getStatusColor={getStatusColor}
                        getStatusText={getStatusText}
                        getStatusIcon={getStatusIcon}
                    />
                )}
                {activeTab === 'familiares' && (
                    <Familiares
                        familiares={familiares}
                        showAddForm={showAddForm}
                        setShowAddForm={setShowAddForm}
                        newFamiliar={newFamiliar}
                        setNewFamiliar={setNewFamiliar}
                        handleAddFamiliar={handleAddFamiliar}
                        handleRemoveFamiliar={handleRemoveFamiliar}
                        onRefresh={loadFamiliares}
                    />
                )}
                {activeTab === 'historico' && selectedProfile && (
                    <Historico familyId={selectedProfile} />
                )}
                {activeTab === 'relatorios' && selectedProfile && (
                    <Relatorios familyId={selectedProfile} />
                )}
            </ScrollView>
        </View>
    );
};

export default FamilyScreen;