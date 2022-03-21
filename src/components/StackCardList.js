import { View, Dimensions, Animated, PanResponder, Vibration } from 'react-native'
import React, { useEffect, useRef, useState, memo } from 'react'

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
const StackCardList = (props) => {

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
    const [indexInfo, setindexInfo] = useState({
        currentIndex: 0,
        prevIndex: -1,
        nextIndex: 1,
        isIncrease: false,
        isDecrease: false
    })

    const [position, setPosition] = useState({
        x: undefined,
        y: undefined,
        width: undefined,
        height: undefined
    })

    var ignore = useRef(false).current

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

    const onIndexIncease = () => {
        // Vibration.vibrate(50)
        setindexInfo({
            currentIndex: indexInfo.currentIndex + 1,
            nextIndex: indexInfo.currentIndex + 2,
            prevIndex: indexInfo.currentIndex,
            isIncrease: true,
            isDecrease: false
        })
    }

    const onIndexDecrease = () => {
        // Vibration.vibrate(50)
        setindexInfo({
            currentIndex: indexInfo.currentIndex - 1,
            nextIndex: indexInfo.currentIndex,
            prevIndex: indexInfo.currentIndex - 2,
            isIncrease: false,
            isDecrease: true
        })
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
                            indexInfo={indexInfo} onRelease={onRelease}
                            onIndexIncease={onIndexIncease}
                            onIndexDecrease={onIndexDecrease}
                        />
                    })
                }
            </View>
        } else {
            return null
        }
    }

    return (
        <View  {...panResponder.panHandlers} style={[props.style, {}]} onLayout={(e) => {
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
    indexInfo,
    containerStyle,
    parentPosition,
    onRelease,
    total,
    onIndexIncease,
    onIndexDecrease }) => {


    const screenOffPoint = height - parentPosition.y

    const isPreviousIndex = index === indexInfo.prevIndex
    const isNextIndex = index === indexInfo.nextIndex
    const isCurrentIndex = index === indexInfo.currentIndex
    const isAnimatingView = isNextIndex || isPreviousIndex || isCurrentIndex

    const translateY = useRef(new Animated.Value(0)).current
    const scaleX = useRef(new Animated.Value(isCurrentIndex || isPreviousIndex ? 1 : 0.8)).current
    const scaleY = useRef(new Animated.Value(isCurrentIndex || isPreviousIndex ? 1 : 0.8)).current

    const scrollYAnimated = useRef(new Animated.Value(0)).current
    const latestVelocity = useRef(0)


    useEffect(() => {
        if (onRelease.release) {
            if (isCurrentIndex) {
                if (onRelease.velocity > 0.6 && scrollYAnimated.__getValue() > 0 && index < total - 1) {
                    latestVelocity.current = onRelease.velocity
                    onIndexIncease()
                } else if (onRelease.velocity > 0.6 && scrollYAnimated.__getValue() < 0 && index != 0) {
                    latestVelocity.current = onRelease.velocity
                    onIndexDecrease()
                } else {
                    Animated.parallel([
                        Animated.spring(scaleX, {
                            toValue: 1,
                            useNativeDriver: true,
                            bounciness: 0,
                        }),
                        Animated.spring(scaleY, {
                            toValue: 1,
                            useNativeDriver: true,
                            bounciness: 0,
                        }),
                        Animated.spring(translateY, {
                            toValue: 0,
                            velocity: latestVelocity.current,
                            useNativeDriver: true,
                            bounciness: 0,
                            speed: 3,
                        })
                    ]).start()
                }
            } else if (isPreviousIndex) {
                Animated.spring(translateY, {
                    toValue: screenOffPoint,
                    velocity: latestVelocity.current,
                    useNativeDriver: true,
                    bounciness: 0,
                    speed: 3,
                }).start()
            } else if (isNextIndex) {
                Animated.parallel([
                    Animated.spring(scaleX, {
                        toValue: 0.8,
                        useNativeDriver: true,
                        bounciness: 0,
                    }),
                    Animated.spring(scaleY, {
                        toValue: 0.8,
                        useNativeDriver: true,
                        bounciness: 0,
                    })
                ]).start()
            }
        }
    }, [onRelease])

    useEffect(() => {

        //Animate card when index increase
        if (indexInfo.isIncrease) {
            if (isPreviousIndex) {
                Animated.spring(translateY, {
                    toValue: screenOffPoint,
                    velocity: latestVelocity.current,
                    useNativeDriver: true,
                    bounciness: 0,
                    speed: 3,
                }).start()
            }
            if (isCurrentIndex) {
                Animated.parallel([
                    Animated.spring(scaleX, {
                        toValue: 1,
                        useNativeDriver: true,
                        bounciness: 0,
                    }),
                    Animated.spring(scaleY, {
                        toValue: 1,
                        useNativeDriver: true,
                        bounciness: 0,
                    }),
                    Animated.spring(translateY, {
                        toValue: 0,
                        velocity: latestVelocity.current,
                        useNativeDriver: true,
                        bounciness: 0,
                        speed: 3,
                    })
                ]).start()
            }
            if (isNextIndex) {
                scaleX.setValue(0)
                scaleY.setValue(0)
                Animated.spring(translateY, {
                    toValue: 0,
                    velocity: latestVelocity.current,
                    useNativeDriver: true,
                    bounciness: 0,
                    speed: 3,
                }).start()
            }
            //Animate card when index decrease
        } else if (indexInfo.isDecrease) {
            if (isPreviousIndex) {
                Animated.spring(translateY, {
                    toValue: screenOffPoint,
                    velocity: latestVelocity.current,
                    useNativeDriver: true,
                    bounciness: 0,
                    speed: 3,
                }).start()
            }
            if (isCurrentIndex) {
                Animated.spring(translateY, {
                    toValue: 0,
                    velocity: latestVelocity.current,
                    useNativeDriver: true,
                    bounciness: 0,
                    speed: 3,
                }).start()
            }
            if (isNextIndex) {
                Animated.parallel([
                    Animated.spring(scaleX, {
                        toValue: 0.8,
                        useNativeDriver: true,
                        bounciness: 0,
                    }),
                    Animated.spring(scaleY, {
                        toValue: 0.8,
                        useNativeDriver: true,
                        bounciness: 0,
                    }),
                    Animated.spring(translateY, {
                        toValue: 0,
                        velocity: latestVelocity.current,
                        useNativeDriver: true,
                        bounciness: 0,
                        speed: 3,
                    })
                ]).start()
            }

        }
    }, [indexInfo])

    useEffect(() => {
        if (total > 1) {

            if (isAnimatingView && Math.abs(scrollYAnimated.__getValue() - scrollY.dy) >= 0.05) {
                scrollYAnimated.setValue(scrollY.dy)

                if (isCurrentIndex) {
                    //Translate
                    var multiple = 1.5
                    var translateValue = scrollY.dy > 0 ? scrollY.dy * multiple : 0

                    if (index === total - 1) {
                        translateY.setValue(scrollY.dy < 15 ? translateValue : 15 * multiple)
                    } else if (index === 0) {
                        translateY.setValue(scrollY.dy > 0 ? translateValue : 0)
                    } else {
                        translateY.setValue(translateValue)
                    }

                    //Scaling
                    if (scrollYAnimated.__getValue() < 0 && scrollYAnimated.__getValue() >= -100) {
                        var scalePercent = Math.abs(scrollYAnimated.__getValue()) * 100 / 200
                        var scaleValue = 1 - (0.2 * scalePercent / 100)
                        scaleX.setValue(scaleValue)
                        scaleY.setValue(scaleValue)
                    }
                }

                if (isNextIndex) {
                    //Scaling
                    if (scrollYAnimated.__getValue() >= 0 && scrollYAnimated.__getValue() <= 200) {
                        var scalePercent = scrollYAnimated.__getValue() * 100 / 200
                        var scaleValue = 0.8 + (0.1 * scalePercent / 100)
                        scaleX.setValue(scaleValue)
                        scaleY.setValue(scaleValue)
                    }
                }

                if (isPreviousIndex) {
                    //Translate
                    if (scrollY.dy < -50) {
                        translateY.setValue(screenOffPoint + (scrollY.dy + 50))
                    }
                }

            }
        }
    }, [scrollY])

    return <Animated.View style={[{
        width: isAnimatingView ? '100%' : '0%',
        height: isAnimatingView ? '100%' : '0%',
        position: 'absolute',
        transform: isAnimatingView ? [{ scaleX: scaleX }, { scaleY: scaleY }, { translateY: translateY }] : []
    }]}>
        <View style={[{ width: '100%', height: '100%' }, containerStyle]}>
            {itemView}
        </View>
    </Animated.View>
})


export default StackCardList
