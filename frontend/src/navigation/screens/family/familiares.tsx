import React from "react"
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
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar"
import { Badge, BadgeText } from "@/components/ui/badge"

type Familiar = {
  id: string
  nome: string
  parentesco: string
  contato: string
  permissoes: string
  status: string 
}

type NovoFamiliar = {
  nome: string
  parentesco: string
  contato: string
  permissoes: string
}

type FamiliaresProps = {
  familiares: Familiar[]
  showAddForm: boolean
  setShowAddForm: (value: boolean) => void
  newFamiliar: NovoFamiliar
  setNewFamiliar: (value: NovoFamiliar) => void
  handleAddFamiliar: () => void
}

export default function Familiares({
  familiares,
  showAddForm,
  setShowAddForm,
  newFamiliar,
  setNewFamiliar,
  handleAddFamiliar,
}: FamiliaresProps) {
  return (
    <VStack space="lg" className="p-4">
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

      {showAddForm && (
        <Card className="p-6">
          <Heading size="sm" className="mb-4">
            Cadastrar Novo Familiar/Cuidador
          </Heading>
          <VStack space="md">
            {/* Nome */}
            <VStack space="xs">
              <Text className="text-sm font-medium text-gray-700">
                Nome Completo *
              </Text>
              <Input>
                <InputField
                  value={newFamiliar.nome}
                  onChangeText={(text) =>
                    setNewFamiliar({ ...newFamiliar, nome: text })
                  }
                  placeholder="Digite o nome completo"
                />
              </Input>
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
                    <SelectItem
                      label="Cuidador Contratado"
                      value="cuidador"
                    />
                    <SelectItem label="Outro" value="outro" />
                  </SelectContent>
                </SelectPortal>
              </Select>
            </VStack>

            <VStack space="xs">
              <Text className="text-sm font-medium text-gray-700">
                E-mail ou Telefone *
              </Text>
              <Input>
                <InputField
                  value={newFamiliar.contato}
                  onChangeText={(text) =>
                    setNewFamiliar({ ...newFamiliar, contato: text })
                  }
                  placeholder="email@exemplo.com ou (11) 99999-9999"
                />
              </Input>
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
                      value="visualizacao"
                    />
                    <SelectItem
                      label="Visualização + Notificações"
                      value="visualizacao + notificacoes"
                    />
                  </SelectContent>
                </SelectPortal>
              </Select>
            </VStack>

            <HStack space="sm" className="pt-4">
              <Button className="flex-1" action="positive" onPress={handleAddFamiliar}>
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

      <VStack space="sm">
        {familiares.map((familiar) => (
          <Card key={familiar.id} className="p-4">
            <HStack className="justify-between items-center">
              <HStack className="items-center" space="sm">
                <Avatar size="md" className="bg-blue-400/20">
                  <AvatarFallbackText className="text-blue-500">
                    {familiar.nome.charAt(0)}
                  </AvatarFallbackText>
                </Avatar>
                <VStack>
                  <Text className="font-medium text-gray-800">
                    {familiar.nome}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {familiar.parentesco}
                  </Text>
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
                <Text className="text-xs text-gray-500 mt-1">
                  {familiar.permissoes}
                </Text>
              </VStack>
            </HStack>

            <HStack space="xs" className="mt-3">
              <Button
                size="xs"
                variant="outline"
                className="bg-gray-100 data-[hover=true]:bg-gray-200 border-0"
              >
                <HStack className="items-center" space="xs">
                  <Ionicons name="create-outline" size={12} color="#374151" />
                  <ButtonText className="text-gray-700 text-xs">
                    Editar
                  </ButtonText>
                </HStack>
              </Button>
              <Button
                size="xs"
                variant="outline"
                className="bg-red-100 data-[hover=true]:bg-red-200 border-0"
              >
                <HStack className="items-center" space="xs">
                  <Ionicons name="trash-outline" size={12} color="#B91C1C" />
                  <ButtonText className="text-red-700 text-xs">
                    Remover
                  </ButtonText>
                </HStack>
              </Button>
            </HStack>
          </Card>
        ))}
      </VStack>
    </VStack>
  )
}
