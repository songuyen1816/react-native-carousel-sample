import { View, Dimensions, Animated, FlatList, StyleSheet } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'

const width = Dimensions.get('window').width

/**
 * @param {{itemSize: Number, 
 * spacing: Number, 
 * data: Array, 
 * style: StyleSheet, 
 * renderItem: Function, 
 * onItemSnapped: Func,
 * keyExtractor: Func,
 * showIndicator: Boolean,
 * indicatorSpacing: Number,
 * horizontalScroll: Boolean,
 * loopedCarousel: Boolean,
 * swipeOnly: Boolean,
 * dotSize: Number,
 * dotSelectedColor: String,
 * dotUnSelectedColor: String,
 * autoScroll: Boolean,
 * autoScrollInterval: Number
 * }} props 
 */
const SnapCarousel = (props) => {

    const flatListRef = useRef(null)
    const [currentItem, setCurrentItem] = useState(0)

    const offset = props.horizontalScroll ? (width - props.itemSize) / 2 : 0

    const scrollX = useRef(new Animated.Value(0)).current

    var interval = useRef(null).current

    const data = []
    data.splice(0, data.length)
    if (props.data) {
        data.push({ id: 0 })
        if (props.loopedCarousel) {
            for (let i = 0; i < 100; i++) {
                props.data.forEach((item, index) => {
                    data.push({ id: data.length, index: index, data: item })
                })
            }
        } else {
            props.data.forEach((item, index) => {
                data.push({ id: data.length, index: index, data: item })
            })
        }
        data.push({ id: data.length })
    }

    useEffect(() => {
        if (props.autoScroll) {
            interval = setInterval(() => {
                if (Math.round((scrollX.__getValue()) % props.itemSize < 10)) {
                    if (currentItem == props.data.length - 1) {
                        setCurrentItem(0)
                    } else {
                        setCurrentItem(currentItem + 1)
                    }
                    flatListRef.current.scrollToOffset({
                        animated: true,
                        offset: currentItem * props.itemSize
                    })
                }
            }, props.autoScrollInterval ? props.autoScrollInterval : 3000)
        }
        return () => {
            if (props.autoScroll) {
                clearInterval(interval)
            }
        }
    }, [])

    const onScroll = (e) => {
        scrollX.setValue(e.nativeEvent.contentOffset.x)
    }

    const onScrollEnd = (e, props) => {
        var currentNextItem = props.horizontalScroll ? Math.round((e.nativeEvent.contentOffset.x) / props.itemSize)
            : Math.round((e.nativeEvent.contentOffset.y) / props.itemSize)
        if (currentNextItem !== currentItem) {
            setCurrentItem(currentNextItem)
            props.onItemSnapped(data[currentNextItem + 1].index)
        }
    }

    return (
        <View style={[props.style, { flexDirection: 'column' }]}>
            {/* Carousel */}
            <FlatList
                onLayout={(e) => {
                    if (props.loopedCarousel) {
                        flatListRef.current.scrollToIndex({ animated: false, index: (data.length / 2 - 1) })
                        setCurrentItem(data.length / 2 - 1)
                    }
                }}
                ref={flatListRef}
                contentContainerStyle={{ alignItems: 'center' }}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                data={data}
                horizontal={props.horizontalScroll}
                keyExtractor={props.keyExtractor}
                renderItem={({ item, index }) => {
                    return (!item.data)
                        ? props.horizontalScroll ? <View style={{ width: offset }} /> : null
                        : <SnapItem
                            itemSize={props.itemSize}
                            spacing={props.spacing}
                            currentItem={currentItem}
                            item={item}
                            index={index}
                            itemView={props.renderItem(item.data, item.index)}
                            horizontalScroll={props.horizontalScroll}
                            scrollX={scrollX}
                        />
                }}
                getItemLayout={(item, index) => ({
                    length: item.id === 0 || item.id === data.length ? offset : props.itemSize, offset: index * props.itemSize, index
                })}
                onScroll={onScroll}
                snapToOffsets={[...Array(data.length)].map((x, i) => (i * props.itemSize))}
                onMomentumScrollEnd={(e) => { onScrollEnd(e, props) }}
                disableIntervalMomentum={true}
                overScrollMode='never'
            />
            {/* Indicator - (not render indicator if vertical*/}
            {props.showIndicator && props.horizontalScroll ?
                <View style={[{
                    height: props.dotSize,
                    marginTop: props.indicatorSpacing ? props.indicatorSpacing : 10
                }, styles.dotContainer]} >
                    {props.data.map((item, index) => {
                        return <Indicator
                            key={item.id}
                            dotSize={props.dotSize ? props.dotSize : 6}
                            dotSelectedColor={props.dotSelectedColor ? props.dotSelectedColor : "#bdc3c7"}
                            dotUnSelectedColor={props.dotUnSelectedColor ? props.dotUnSelectedColor : "#7f8c8d"}
                            itemSize={props.itemSize}
                            currentItem={currentItem}
                            item={item}
                            index={index + 1}
                            totalSize={props.data.length}
                            scrollX={scrollX}
                        />
                    })}
                </View>
                : null}
        </View>
    )
}

const SnapItem = React.memo(({ itemSize, spacing, currentItem, item, index, itemView, horizontalScroll, scrollX }) => {
    const inputRange = [
        (index - 2) * itemSize,
        (index - 1) * itemSize,
        index * itemSize,
    ];

    const indexNoOffset = index - 1
    var scaleX, scaleY, opacity

    const isAnimatingView =
        (currentItem - indexNoOffset <= 1 || currentItem - indexNoOffset >= -1 || currentItem === indexNoOffset) && horizontalScroll

    if (isAnimatingView) {
        scaleY = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
        });

        scaleX = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
        });

        opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: 'clamp'
        })
    }

    return <Animated.View key={item.id}
        style={{
            width: itemSize,
            height: horizontalScroll ? '100%' : itemSize,
            transform: isAnimatingView ? [{ scaleX }, { scaleY }] : [],
            opacity: isAnimatingView ? opacity : 1
        }}>
        <View style={{
            marginHorizontal: horizontalScroll ? spacing : 0,
            marginVertical: horizontalScroll ? 0 : spacing
        }}>
            {itemView}
        </View>
    </Animated.View>
})

const Indicator = React.memo(({ itemSize,
    currentItem,
    dotSize,
    dotSelectedColor,
    dotUnSelectedColor,
    item,
    index,
    totalSize,
    scrollX }) => {

    var multiple = 0;
    if (currentItem + 1 > totalSize) {
        var multiple = ~~((currentItem) / totalSize)
    }

    const inputRange = [
        ((totalSize * multiple) + index - 2) * itemSize,
        ((totalSize * multiple) + index - 1) * itemSize,
        ((totalSize * multiple) + index) * itemSize,
    ];

    const indicatorWidth = scrollX.interpolate({
        inputRange,
        outputRange: [dotSize, dotSize * 2.3, dotSize],
        extrapolate: 'clamp',
    });

    const color = scrollX.interpolate({
        inputRange,
        outputRange: [dotUnSelectedColor, dotSelectedColor, dotUnSelectedColor],
        extrapolate: 'clamp'
    });

    return <Animated.View style={{
        width: indicatorWidth,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: color,
        marginHorizontal: dotSize / 2,
    }} />
})

const styles = StyleSheet.create({
    dotContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default SnapCarousel
