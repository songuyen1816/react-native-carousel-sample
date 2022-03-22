import { View, Dimensions, Animated, FlatList, StyleSheet, PanResponder, Easing } from 'react-native'
import React, { useEffect, useRef, useState, memo } from 'react'
import { elementsThatOverlapOffsets } from 'react-native/Libraries/Lists/VirtualizeUtils'

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height


/**
 * @param {{
 * data: Array, 
 * style: StyleSheet, 
 * containerStyle: StyleSheet,
 * renderItem: Function, 
 * onItemSnapped: Func,
 * }} props 
 */
const StackCards = (props) => {

    const data = []

    data.splice(0, data.length)
    data.push(...props.data)

    const [scrollY, setScrollY] = useState({
        dy: 0,
        velocity: 0
    })
    const [onRelease, setOnRelease] = useState({
        release: false,
        velocity: 0
    })
    const [currentItem, setCurrentItem] = useState(0)
    const [position, setPosition] = useState({
        x: undefined,
        y: undefined,
        width: undefined,
        height: undefined
    })
    const [isAnimating, setIsAnimating] = useState(false)

    var ignore = useRef(false).current
    var firstScroll = useRef(true).current

    var interval = useRef(null).current

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderStart: (evt, gestureState) => {
                setOnRelease({ release: false, velocity: 0 })
            },
            onPanResponderMove: (evt, gestureState) => {
                setScrollY({
                    dy: gestureState.dy,
                    velocity: gestureState.vy
                })
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (!ignore) {
                    firstScroll = true
                    setOnRelease({ release: true, velocity: Math.abs(gestureState.vy) })
                }
            }
        })
    ).current

    const onIndexChanged = (index) => {
        // setScrollY({
        //     dy: 0,
        //     velocity: 0
        // })
        setCurrentItem(index)
        setIsAnimating(false)
    }

    const onAnimating = () => {
        setIsAnimating(true)
    }

    const renderCardItems = (parentPosition) => {
        if (parentPosition.x != undefined) {
            return <View style={{ width: '100%', flex: 1 }} >
                {
                    data.reverse().map((item, index) => {
                        return <CardItem containerStyle={props.containerStyle}
                            key={data.length - 1 - index}
                            itemView={props.renderItem(item, data.length - 1 - index)}
                            parentPosition={parentPosition}
                            scrollY={scrollY}
                            index={data.length - 1 - index}
                            total={data.length}
                            currentIndex={currentItem} onRelease={onRelease}
                            onIndexChanged={onIndexChanged}
                            onAnimating={onAnimating}
                        />
                    })
                }
            </View>
        } else {
            return null
        }
    }

    return (
        <View  {...panResponder.panHandlers} pointerEvents={isAnimating ? 'none' : 'auto'} style={[props.style, { overflow: 'hidden' }]} onLayout={(e) => {
            setPosition({
                x: e.nativeEvent.layout.x,
                y: e.nativeEvent.layout.y,
                width: e.nativeEvent.layout.width,
                height: e.nativeEvent.layout.height
            })
        }}>
            {renderCardItems(position)}
        </View>
    )
}

const CardItem = memo(({ itemView,
    scrollY,
    index,
    currentIndex,
    containerStyle,
    parentPosition,
    onRelease,
    total,
    onIndexChanged,
    onAnimating }) => {


    const screenOffPoint = parentPosition.height + 20
    const centerPoint = (screenOffPoint) / 2

    const scrollYAnimated = useRef(new Animated.Value(0)).current

    const isPreviousIndex = index === currentIndex - 1
    const isNextIndex = index === currentIndex + 1
    const isCurrentIndex = index === currentIndex
    const isAnimatingView = isNextIndex || isPreviousIndex || isCurrentIndex

    const valueListeners = useRef([]).current


    var scaleX = undefined, scaleY = undefined, translateY = undefined

    switch (index) {
        case currentIndex:
            scaleX = scrollYAnimated.interpolate({
                inputRange: [-centerPoint, 0],
                outputRange: [0.8, 1],
                extrapolate: 'clamp'
            })

            scaleY = scrollYAnimated.interpolate({
                inputRange: [-centerPoint, 0],
                outputRange: [0.8, 1],
                extrapolate: 'clamp'
            })

            translateY = scrollYAnimated.interpolate({
                inputRange: [5, centerPoint],
                outputRange: [0, screenOffPoint],
                extrapolate: 'clamp'
            })

            break;
        case currentIndex + 1:
            scaleX = scrollYAnimated.interpolate({
                inputRange: [0, centerPoint],
                outputRange: [0.8, 1],
                extrapolate: 'clamp'
            })
            scaleY = scrollYAnimated.interpolate({
                inputRange: [0, centerPoint],
                outputRange: [0.8, 1],
                extrapolate: 'clamp'
            })
            translateY = scrollYAnimated.interpolate({
                inputRange: [-screenOffPoint, 0, screenOffPoint],
                outputRange: [0, 0, 0],
                extrapolate: 'clamp'
            })
            break;

        case currentIndex - 1:
            scaleX = scrollYAnimated.interpolate({
                inputRange: [0, screenOffPoint],
                outputRange: [1.0, 1.1],
                extrapolate: 'clamp'
            })
            scaleY = scrollYAnimated.interpolate({
                inputRange: [0, centerPoint],
                outputRange: [1.0, 1.1],
                extrapolate: 'clamp'
            })

            translateY = scrollYAnimated.interpolate({
                inputRange: [-centerPoint, -50],
                outputRange: [0, screenOffPoint],
                extrapolate: 'clamp'
            })
            break;

    }


    useEffect(() => {
        if (onRelease.release) {
            var valueTo
            if (isCurrentIndex) {
                if (scrollYAnimated.__getValue() < -30 && scrollY.velocity < -0.5) {
                    valueTo = -centerPoint
                }
                else if (scrollYAnimated.__getValue() > 30 && scrollY.velocity > 0.5) {
                    valueTo = centerPoint
                } else {
                    valueTo = 5
                }
            } else if (isNextIndex) {
                if (scrollY.velocity < 0.5) {
                    valueTo = -100
                } else if (scrollYAnimated.__getValue() > 0) {
                    valueTo = centerPoint
                }
            } else if (isPreviousIndex) {
                if (scrollYAnimated.__getValue() < 0 && scrollY.velocity < -0.5) {
                    valueTo = -centerPoint
                } else {
                    valueTo = 5
                }
            }

            if (isAnimatingView) {
                //     Animated.spring(scrollYAnimated, {
                //         velocity: onRelease.velocity,
                //         toValue: valueTo,
                //         useNativeDriver: true
                //     }).start()
                const listenerId = scrollYAnimated.addListener((value) => {
                    // console.log('Value listener: ' + value.value)


                    if (Math.abs(value.value - valueTo) < 40) {
                        // console.log(value.value + '  /  ' + valueTo + ' / ')

                        if (currentIndex == index) {
                            if (valueTo === centerPoint && index + 1 < total) {
                                // onAnimating()
                                onIndexChanged(index + 1)

                            } else if (valueTo === -centerPoint && index - 1 >= 0) {
                                onIndexChanged(index - 1)
                            }
                        }
                        scrollYAnimated.removeListener(listenerId)
                    }
                })

                if (isCurrentIndex) {
                    if ((valueTo === centerPoint && index + 1 < total) || (valueTo === -centerPoint && index - 1 >= 0)) {
                        onAnimating()
                    }
                }
                Animated.spring(scrollYAnimated, {
                    toValue: valueTo,
                    velocity: onRelease.velocity,
                    useNativeDriver: true,
                    speed: 4,
                }).start()


            }
        }
    }, [onRelease])

    useEffect(() => {
        if (total > 1) {
            //TODO
            if (isAnimatingView && Math.abs(scrollYAnimated.__getValue() - scrollY.dy) >= 0.5) {
                if (currentIndex === total - 1) {
                    if (scrollY.dy < 30) {
                        scrollYAnimated.setValue(scrollY.dy)
                    } else {
                        scrollYAnimated.setValue(30)
                    }
                } else if (currentIndex === 0) {
                    if (scrollY.dy > -30) {
                        scrollYAnimated.setValue(scrollY.dy)
                    } else {
                        scrollYAnimated.setValue(-30)
                    }
                } else {
                    scrollYAnimated.setValue(scrollY.dy)
                }
            }
        }
    }, [scrollY])

    return <Animated.View style={[{ width: isAnimatingView ? '100%' : '0%', height: isAnimatingView ? '100%' : '0%', position: 'absolute', transform: isAnimatingView ? [{ scaleX }, { scaleY }, { translateY }] : [] }]}>
        <View style={[{ width: '100%', height: '100%' }, containerStyle]}>
            {itemView}
        </View>
    </Animated.View>
})


export default StackCards
