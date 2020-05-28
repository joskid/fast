---
id: fast-foundation.designsystemprovider.disconnectedcsscustompropertyregistry
title: DesignSystemProvider.disconnectedCSSCustomPropertyRegistry property
hide_title: true
---
<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[@microsoft/fast-foundation](./fast-foundation.md) &gt; [DesignSystemProvider](./fast-foundation.designsystemprovider.md) &gt; [disconnectedCSSCustomPropertyRegistry](./fast-foundation.designsystemprovider.disconnectedcsscustompropertyregistry.md)

## DesignSystemProvider.disconnectedCSSCustomPropertyRegistry property

Allows CSSCustomPropertyDefinitions to register on this element \*before\* the constructor has run and the registration APIs exist. This can manifest when the DOM is parsed (and custom element tags exist in the DOM) before the script defining the custom elements and elements is parsed, and the elements using the CSSCustomPropertyBehaviors are defined before this DesignSystemProvider.

<b>Signature:</b>

```typescript
disconnectedCSSCustomPropertyRegistry: CSSCustomPropertyDefinition[];
```