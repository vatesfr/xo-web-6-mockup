## Specification

### Views

In Xen Orchestra 6 release, a tree view will be added in order to display objects heicically.
In order to achieve this, a default map tree view should be set.

#### Basic tree 
```bash
pool
│
├── VM
│   ├── VBD
│   └── VM_snapshot
├── VM_template
├── VM_controller
├── Host
│   ├── FGPU
│   ├── PBD
│   └── PCI
├── SR
│   ├── VDI
│   ├── VDI_snapshot
│   └── VDI_unmanaged
└── Network
    ├── VIF
    └── PIF
```

#### Infinite tree

```bash
pool
│
├── VM
│   ├── VBD
│   ├── VIF
│   │    └── Network
│   │            └── VIF
│   │                 └── Network
│   │                          └── VIF
│   │                               └── ∞
│   └── VM_snapshot
├── VM_template
│   ├── VBD
│   └── VM_snapshot
├── VM_controller
│   ├── VBD
│   └── VM_snapshot
├── Host
│   ├── FGPU
│   ├── PBD
│   └── PCI
├── SR
│   ├── VDI
│   ├── VDI_snapshot
│   └── VDI_unmanaged
└── Network
    ├── VIF
    └── PIF
```

### Filtering

#### View (saved, uncollapsable)
- name
- filter: only on top-level objects
- group by: type, tag, folder, ...

#### Manual search
- Filter all XO objects
- For each object, go up the infra until you find a top-level node to determine path
