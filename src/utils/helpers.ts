
export function getStatusStyle(status: string) {
    const styles: Record<string, object> = {
        'Contact Made': { backgroundColor: '#14B8A6' },
        'Lead': { backgroundColor: '#F97316' },
        'Sold': { backgroundColor: '#22C55E' },
        'Not Interested': { backgroundColor: '#EAB308' },
        'No Answer': { backgroundColor: '#EF4444' },
        'Not Home': { backgroundColor: '#EF4444' },
    };
    return styles[status] || { backgroundColor: '#6B7280' };
}

export function getLeadStatusStyle(status: string) {
    const styles: Record<string, object> = {
        'New': { backgroundColor: '#3B82F6' },
        'Contacted': { backgroundColor: '#14B8A6' },
        'Qualified': { backgroundColor: '#F97316' },
        'Sold': { backgroundColor: '#22C55E' },
        'Lost': { backgroundColor: '#EF4444' },
    };
    return styles[status] || { backgroundColor: '#6B7280' };
}
