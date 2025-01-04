/**
 * A component to allow an entry of a time value in minutes from 0-60
 *
 * TM352 TMA02
 * Change log
 * 3/10/23 CThomson Intial version
 */

import {StyleSheet, Text, TextInput, View} from 'react-native';

type WaitTimeProps = {
    label: string;
    minutes: string;
    onChangeMinutes: (text: string) => void;
};

export default function WaitTime(props: WaitTimeProps) {
    return (
        <View style={styles.container}>
            <Text>{props.label}</Text>
            <TextInput style={styles.input}
                       placeholder='mm'
                       value={props.minutes}
                       onChangeText={props.onChangeMinutes}
                       inputMode='numeric'/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    input: {
        height: 40,
        margin: 5,
        borderWidth: 1,
        padding: 5,
        width: 40,
    },
});