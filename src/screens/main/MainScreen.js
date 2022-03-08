import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Image } from 'react-native'
import React, { Component } from 'react'
import Toolbar from '../../components/Toolbar'
import StackCards from '../../components/StackCards'
import SnapCarousel from '../../components/SnapCarousel'

const data = [{ id: 1, name: 'Song 1', url: 'https://picsum.photos/200/250' },
{ id: 2, name: 'Song 2', url: 'https://picsum.photos/200/254' },
{ id: 3, name: 'Song 3', url: 'https://picsum.photos/200/253' },
{ id: 4, name: 'Song 4', url: 'https://picsum.photos/200/255' }]


const width = Dimensions.get('window').width

export class MainScreen extends Component {

    goToPlaying = () => {
        navigation.navigate('Playing')
    }

    render() {
        return (
            <View style={styles.container}>
                <Toolbar title='Carousel sample' />
                <View style={styles.mainContent}>
                
                    <SnapCarousel style={{ width: width, height: 200, marginTop: 15 }}
                        itemSize={width * 0.75}
                        spacing={10}
                        data={data}
                        renderItem={this.renderItem}
                        onItemSnapped={this.onItemSnapped}
                        showIndicator={true}
                        dotSize={7}
                        dotSelectedColor="#bdc3c7"
                        dotUnSelectedColor='#7f8c8d'
                        autoScroll={false}
                        autoScrollInterval={3000}
                    />

                    <StackCards data={data}
                        renderItem={this.renderItem}
                        style={{ width: width * 0.9, height: 470, marginTop: 10 }}
                        containerStyle={{ padding: 15 }}
                        onItemSnapped={this.onItemSnapped}
                    />
                </View>
            </View>
        )
    }

    renderItem = (item, index) => {
        return <Image style={{ height: '100%', borderRadius: 10 }} source={{ uri: item.url }} />
    }

    onItemSnapped = (index) => {
    }
}

export default MainScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'flex-start',
    },
    mainContent: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    }
})