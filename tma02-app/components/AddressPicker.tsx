/**
 * A component to allow an entry of an address. The parent view
 * needs to handle the address lookup
 *
 * TM352 TMA02
 * Change log
 * 3/10/23 CThomson Intial version
 */

import {Button, GestureResponderEvent, StyleSheet, TextInput, View} from 'react-native';

type AddressPickerProps = {
    label: string;
    address: string;
    onClick: (event: GestureResponderEvent) => void;
    onChangeAddress: (text: string) => void;
};

export default function AddressPicker(props: AddressPickerProps) {

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder={props.label} accessibilityLabel={props.label}
                       value={props.address} onChangeText={props.onChangeAddress}/>
            <Button
                title='Set current location'
                onPress={props.onClick}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingHorizontal: 24,
    },
    input: {
        height: 40,
        margin: 5,
        borderWidth: 1,
        padding: 5,
    }
});