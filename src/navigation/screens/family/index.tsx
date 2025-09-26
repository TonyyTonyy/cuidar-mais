import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { HStack } from "@/components/ui/hstack"
import { Box } from "@/components/ui/box"
import { Ionicons } from '@expo/vector-icons';
import Inicio from './inicio';
import Familiares from './familiares';
import Historico from './historico';
import Relatorios from './relatorios';

const FamilyScreen = () => {
    const [activeTab, setActiveTab] = useState('inicio');
    const [selectedProfile, setSelectedProfile] = useState('maria');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newFamiliar, setNewFamiliar] = useState({
        nome: '',
        parentesco: '',
        contato: '',
        permissoes: 'visualizacao'
    });

    const profiles = {
        maria: { name: 'Maria Silva', age: 78 },
        joao: { name: 'João Santos', age: 82 }
    };

    const medicamentosHoje = [
        { nome: 'Losartana', horario: '08:00', tomado: true, tipo: 'pressão' },
        { nome: 'Metformina', horario: '12:00', tomado: true, tipo: 'diabetes' },
        { nome: 'Omeprazol', horario: '14:30', tomado: false, tipo: 'estômago' },
        { nome: 'Sinvastatina', horario: '20:00', tomado: false, tipo: 'colesterol' }
    ];

    const familiares = [
        { id: "1", nome: 'Ana Silva', parentesco: 'Filha', status: 'ativo', permissoes: 'visualizacao + notificacoes', contato: '1234-5678' },
        { id: "2", nome: 'Carlos Silva', parentesco: 'Filho', status: 'ativo', permissoes: 'visualizacao', contato: '1234-5678' },
        { id: "3", nome: 'Rosa Santos', parentesco: 'Cuidadora', status: 'pendente', permissoes: 'visualizacao', contato: '1234-5678' }
    ];

    const handleAddFamiliar = () => {
        console.log('Adicionando familiar:', newFamiliar);
        setShowAddForm(false);
        setNewFamiliar({ nome: '', parentesco: '', contato: '', permissoes: 'visualizacao' });
    };

    const getStatusColor = (med: any) => {
        if (med.tomado) return 'success';
        if (new Date().getHours() > parseInt(med.horario.split(':')[0])) return 'error';
        return 'muted';
    };

    const getStatusText = (med: any) => {
        if (med.tomado) return 'Tomado';
        if (new Date().getHours() > parseInt(med.horario.split(':')[0])) return 'Atrasado';
        return 'Pendente';
    };

    const getStatusIcon = (med: any) => {
        if (med.tomado) return 'checkmark-circle';
        if (new Date().getHours() > parseInt(med.horario.split(':')[0])) return 'close-circle';
        return 'time-outline';
    };

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
                            className={`flex-1 items-center py-2 px-1 rounded-lg ${activeTab === tab.id ? 'bg-blue-100' : ''
                                }`}
                        >
                            <Ionicons
                                name={tab.icon as any}
                                size={16}
                                color={activeTab === tab.id ? '#2563EB' : '#6B7280'}
                            />
                            <Text
                                className={`text-xs mt-1 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'
                                    }`}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </HStack>
            </Box>

            <ScrollView className="flex-1">
                {activeTab === 'inicio' && <Inicio
                    profiles={profiles}
                    selectedProfile={selectedProfile}
                    setSelectedProfile={setSelectedProfile}
                    medicamentosHoje={medicamentosHoje}
                    setActiveTab={setActiveTab}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                    getStatusIcon={getStatusIcon}
                />}
                {activeTab === 'familiares' && <Familiares
                    familiares={familiares}
                    showAddForm={showAddForm}
                    setShowAddForm={setShowAddForm}
                    newFamiliar={newFamiliar}
                    setNewFamiliar={setNewFamiliar}
                    handleAddFamiliar={handleAddFamiliar}
                />}
                {activeTab === 'historico' && <Historico />}
                {activeTab === 'relatorios' && <Relatorios />}
            </ScrollView>
        </View>
    );
};

export default FamilyScreen;