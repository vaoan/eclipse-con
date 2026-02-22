# SOLID Principles

Apply SOLID principles adapted for a React + TypeScript SPA.

## Single Responsibility Principle (SRP)

Each module, component, or function should have **one reason to change**.

- A component renders UI — it does not fetch data or manage business logic.
- A hook manages a specific piece of state or effect — not everything at once.
- A service handles one external concern (API, storage, etc.).

## Open/Closed Principle (OCP)

Modules should be **open for extension, closed for modification**.

- Use composition and props to extend component behavior.
- Use strategy patterns or configuration objects instead of modifying existing functions.
- Prefer adding new variants over changing existing ones.

## Liskov Substitution Principle (LSP)

Subtypes must be **substitutable** for their base types.

- If a component accepts `ButtonProps`, any extension of `ButtonProps` must still work.
- Implementations of an interface must fulfill the full contract.

## Interface Segregation Principle (ISP)

Prefer **small, focused interfaces** over large, general-purpose ones.

- Component props should only include what the component actually uses.
- Split large interfaces into smaller ones that can be composed.

```ts
// Prefer
interface Nameable {
  readonly name: string;
}
interface Timestamped {
  readonly createdAt: Date;
}
interface User extends Nameable, Timestamped {
  readonly id: string;
}
```

## Dependency Inversion Principle (DIP)

High-level modules should **depend on abstractions**, not on concrete implementations.

- Domain and application layers define interfaces (ports).
- Infrastructure layer provides implementations (adapters).
- Use dependency injection via React context or function parameters.

```ts
// Application layer defines the port
interface UserRepository {
  getById(id: string): Promise<User>;
}

// Infrastructure layer provides the adapter
class ApiUserRepository implements UserRepository {
  async getById(id: string): Promise<User> { ... }
}
```
