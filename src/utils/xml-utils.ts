/**
 * Utility functions for XML parsing and manipulation
 */

/**
 * Helper to safely extract string content from XML object or string
 */
export function getStringContent(val: unknown): string {
    if (val === null || val === undefined) return ''
    if (typeof val === 'string') return val
    if (typeof val === 'object' && val !== null) {
        const v = val as Record<string, unknown>
        return String(v['#text'] || v.text || v.content || '')
    }
    return String(val)
}

/**
 * Helper to convert XML element to object
 */
export function xmlToObject(element: Element): Record<string, any> | string {
    const obj: Record<string, any> = {}

    // Get text content
    if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
        return element.textContent || ''
    }

    // Get attributes
    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i]
        obj[`@${attr.name}`] = attr.value
    }

    // Get child elements
    const children = element.children
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const childObj = xmlToObject(child)
        const tagName = child.tagName

        if (obj[tagName]) {
            if (!Array.isArray(obj[tagName])) {
                obj[tagName] = [obj[tagName]]
            }
            obj[tagName].push(childObj)
        } else {
            obj[tagName] = childObj
        }
    }

    // Add text content if exists
    const text = element.textContent?.trim()
    if (text && Object.keys(obj).length === 0) {
        return text
    } else if (text) {
        obj['#text'] = text
    }

    return obj
}
