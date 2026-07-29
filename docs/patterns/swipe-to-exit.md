# Swipe to exit

Fullscreen Be skills in this repo use **swipe down** on the face to leave the skill and return via Be’s normal exit flow.

Used by: `@be/bad-apple`, `@be/jukebox`, `@be/doom`, `@be/recipe` (skill-level handler).

## Mechanism

Jibo’s touch layer emits gestures on a shared event bus:

```typescript
jibo.globalEvents.shared.screenGesture
```

Swipe-down is reported as the string **`swipedown`** (case may vary — compare with `.toLowerCase()`).

## Implementation pattern

In your `BeSkill` subclass:

```typescript
private exiting: boolean = false;
private screenGestureHandler: (gesture: string) => void = null;

protected subscribeSwipeDown (): void {
  const shared: any = (jibo as any).globalEvents?.shared;
  if (!shared?.screenGesture) { return; }

  this.screenGestureHandler = (gesture: string) => {
    if (String(gesture).toLowerCase() !== 'swipedown' || this.exiting) {
      return;
    }
    this.exiting = true;
    (this as any).exit();
  };
  shared.screenGesture.on(this.screenGestureHandler);
}

protected unsubscribeSwipeDown (): void {
  if (!this.screenGestureHandler) { return; }
  const shared: any = (jibo as any).globalEvents?.shared;
  if (shared?.screenGesture) {
    shared.screenGesture.removeListener(this.screenGestureHandler);
  }
  this.screenGestureHandler = null;
}
```

**`open`:** call `subscribeSwipeDown()`.

**`close`:** call `unsubscribeSwipeDown()`.

## Why the `exiting` flag

Prevents double-exit if the user swipes twice quickly or if gesture events repeat.

## UI hint

Bad Apple shows a small on-screen hint: “Swipe down to exit”. Consider similar copy for any skill that hides the normal menu chrome.

## Recipe nuance

On some Recipe screens, swipe-down means “back to categories” instead of exiting the whole skill. The same gesture API is used; behavior depends on which view is active. For new simple skills, skill-level exit is enough.

## Related

- [face-ui.md](face-ui.md) — where to mount content above the touch layer
- [creating-a-skill.md](../creating-a-skill.md)
