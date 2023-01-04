import { useEffect, useState } from 'react';
import { Alert, FlatList, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { ButtonIcon } from '@components/ButtonIcon';
import { Filter } from '@components/Filter';
import { Header } from '@components/Header';
import { Highlight } from '@components/Highlight';
import { Input } from '@components/Input';
import { PlayerCard } from '@components/PlayerCard';
import { ListEmpty } from '@components/ListEmpty';
import { Button } from '@components/Button';
import { Loading } from '@components/Loading';

import { AppError } from '@utils/AppError';

import { playerAddByGroup } from '@storage/player/playerAddByGroup';
import { playersGetByGroupAndTeam } from '@storage/player/playersGetByGroupAndTeam';
import { PlayerStorageDTO } from '@storage/player/PlayerStorageDTO';
import { playerRemoveByGroup } from '@storage/player/playerRemoveByGroup';
import { groupRemoveByName } from '@storage/group/groupRemoveByName';

import { Container, Form, HeaderList, NumbersOfPlayers } from './styles';

type RouteParams = {
  group: string
}

export function Players(){
  const [isLoading, setIsLoading] = useState(true)
  const [team, setTeam] = useState('Time A')
  const [players, setPlayers] = useState<PlayerStorageDTO[]>([])
  const [newPLayerName, setNewPLayerName] = useState('')

  const route = useRoute()
  const { group } = route.params as RouteParams

  const navigation = useNavigation()

  async function handleAddPlayer(){    
    if(newPLayerName.trim().length === 0){
      return Alert.alert('Nova pessoa', 'Informe o nome da pessoa para adicionar')
    }

    const newPLayer = {
      name: newPLayerName,
      team
    }

    try {
      await playerAddByGroup(newPLayer, group)

      setNewPLayerName('')
      Keyboard.dismiss()

      fetchPlayersByTeam()

    } catch (error) {
      if(error instanceof AppError){
        Alert.alert('Nova pessoa', error.message)
      } else {
        Alert.alert('Nova pessoa', 'Não foi possivel adicionar')
      }
    }
  }

  async function fetchPlayersByTeam(){
    try {
      setIsLoading(true)

      const playersByTeam = await playersGetByGroupAndTeam(group, team)
      
      setPlayers(playersByTeam)

    } catch (error) {
      Alert.alert('Pessoas', 'Não foi possível carregar as pessoas filtradas do time selecionado')

    } finally {
      setIsLoading(false)
    }
  }

  async function handlePlayerRemove(playerName: string){
    try {
      await playerRemoveByGroup(playerName, group)

      fetchPlayersByTeam()

    } catch (error) {
      Alert.alert('Remover pessoa', 'Não foi possível remover essa pessoa')
    }
  }

  async function handleGroupRemove(){
    Alert.alert(
      'Remover',
      'Deseja remover a turma?',
      [
        { text:'Não', style: 'cancel' },
        { text: 'Sim', onPress: () => groupRemove() }
      ]
    )
  }

  async function groupRemove(){
    try {
      await groupRemoveByName(group)

      navigation.navigate('groups')

    } catch (error) {
      Alert.alert('Remover turmas', 'Não foi possível remover o turmas')
    }
  }

  useEffect(() => {
    fetchPlayersByTeam()
  }, [team])
  
  return (
    <Container>
      <Header showBackButton/>

      <Highlight
        title={group}
        subtitle='Adicione a galera e separe os times'
      />

      <Form>
        <Input
          onChangeText={setNewPLayerName}
          value={newPLayerName}
          placeholder='Nome da pessoa'
          autoCorrect={false}
          onSubmitEditing={handleAddPlayer}
          returnKeyType='done'
        />

        <ButtonIcon
          icon='add'
          onPress={handleAddPlayer}
        />
      </Form>

      <HeaderList>
        <FlatList
          data={['Time A', 'Time B']}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <Filter
              title={item}
              isActive={item === team}
              onPress={() => setTeam(item)}
            />
          )}
          horizontal
          showsVerticalScrollIndicator={false}
        />

        <NumbersOfPlayers>
          {players.length}
        </NumbersOfPlayers>
      </HeaderList>

      {isLoading ? 
        <Loading/>
        :  
        <FlatList
          data={players}
          keyExtractor={item => item.name}
          renderItem={({ item }) => (
            <PlayerCard
              name={item.name}
              onRemove={() => handlePlayerRemove(item.name)}
            />
          )}
          ListEmptyComponent={<ListEmpty message='Não há pessoas nesse time'/>}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ paddingBottom: 100 }, players.length === 0 && { flex: 1 }]}
        />
      }

     

      <Button 
        title='Remover turma'
        type='SECONDARY'
        onPress={handleGroupRemove}
      />
    </Container>
  )
}