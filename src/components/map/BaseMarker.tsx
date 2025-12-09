import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Color mappings for marker colors
const MARKER_COLORS: Record<string, string> = {
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#EAB308',
    green: '#22C55E',
    teal: '#14B8A6',
    blue: '#3B82F6',
    cyan: '#06B6D4',
    purple: '#A855F7',
    pink: '#EC4899',
    grey: '#6B7280',
    gray: '#6B7280',
    darkgrey: '#374151',
    black: '#1F2937',
    maroon: '#7F1D1D',
    white: '#FFFFFF',
};

// Icon mapping from Lucide to Ionicons
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
    Circle: 'ellipse',
    History: 'time-outline',
    PhoneForwarded: 'call-outline',
    CalendarCheck: 'calendar-outline',
    HeartHandshake: 'heart-outline',
    UserRoundX: 'person-remove-outline',
    ArchiveX: 'archive-outline',
    Frown: 'sad-outline',
    Ban: 'ban-outline',
    ShieldAlert: 'shield-outline',
    Container: 'cube-outline',
    LogIn: 'log-in-outline',
    House: 'home-outline',
    PenOff: 'create-outline',
    CircleCheck: 'checkmark-circle-outline',
    CloudOff: 'cloud-offline-outline',
    ClipboardList: 'clipboard-outline',
    CircleX: 'close-circle-outline',
    default: 'location',
};

interface BaseMarkerProps {
    color: string;
    shape?: 'balloon' | 'circle' | 'square';
    iconName?: string;
    iconColor?: string;
    size?: number;
}

export function BaseMarker({
    color,
    shape = 'balloon',
    iconName = 'Circle',
    iconColor = '#FFFFFF',
    size = 32,
}: BaseMarkerProps) {
    const resolvedColor = MARKER_COLORS[color] || color;
    const ionIconName = ICON_MAP[iconName] || ICON_MAP.default;
    const iconSize = size * 0.5;

    // Simple balloon/pin shape using Views
    if (shape === 'balloon') {
        return (
            <View style={styles.balloonContainer}>
                {/* Main circle */}
                <View
                    style={[
                        styles.balloonCircle,
                        {
                            backgroundColor: resolvedColor,
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                        }
                    ]}
                >
                    <Ionicons name={ionIconName} size={iconSize} color={iconColor} />
                </View>
                {/* Pin point */}
                <View
                    style={[
                        styles.balloonPoint,
                        {
                            borderTopColor: resolvedColor,
                            borderLeftWidth: size / 4,
                            borderRightWidth: size / 4,
                            borderTopWidth: size / 3,
                        }
                    ]}
                />
            </View>
        );
    }

    // Circle shape
    if (shape === 'circle') {
        return (
            <View
                style={[
                    styles.circleMarker,
                    {
                        backgroundColor: resolvedColor,
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    }
                ]}
            >
                <Ionicons name={ionIconName} size={iconSize} color={iconColor} />
            </View>
        );
    }

    // Square shape
    return (
        <View
            style={[
                styles.squareMarker,
                {
                    backgroundColor: resolvedColor,
                    width: size,
                    height: size,
                    borderRadius: 4,
                }
            ]}
        >
            <Ionicons name={ionIconName} size={iconSize} color={iconColor} />
        </View>
    );
}

const styles = StyleSheet.create({
    balloonContainer: {
        alignItems: 'center',
    },
    balloonCircle: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    balloonPoint: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -2,
    },
    circleMarker: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    squareMarker: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default BaseMarker;
