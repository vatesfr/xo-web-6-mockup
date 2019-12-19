## Overview

- Project: **Proof of concept : Xen Orchestra Web 6**
- Repository : https://github.com/vatesfr/xo-web-6-mockup
- Related issue : https://github.com/vatesfr/xen-orchestra/issues/4446

## What have been done so far:

### Filterable tree :

##### Features: 
- Search bar with [complex matcher syntax](https://www.npmjs.com/package/complex-matcher?activeTab=readme) 
- 2 default saved searchs (each search represents a tree view constructed according to a defined [map](https://github.com/vatesfr/xo-web-6-mockup/blob/master/src/menu/index.js#L112): 
  - **Infrastructure search** : displays a tree view respresenting pools with their nested objects.
  - **By type search:** displays a tree view representing objects grouped by type.
- **New search:** 
a user can create a customizable search represented by a tree view. This search depends optionally on two optional parameters : 
  - **filter:** [complex matcher syntax](https://www.npmjs.com/package/complex-matcher?activeTab=readme) (To improve)
  - **groupe by:** Type, Tag, Folder
- Number of displayed elements is limited, Therefore, a button <display more> is displayed under each collection that exceeds 20 elements.

## Issues encountered : 
- **Non infinite depth search** : The goal of a tree view is to display objects hierarchy in order to have more information about objects, for instance : 
```
pool
├── VM
│   ├── VBD
│   └── VIF
├── VM_template
├── VM_snapshot
├── VM_controller
├── host
│   ├── FGPU
│   ├── PBD
│   ├── PCI
│   └── PIF
├── SR
│   ├── VDI
│   ├── VDI_snapshot
│   └── VDI_unmanaged
└── network
``` 
Thanks to this view, we can easily know which `VM` is related to a specific `pool`, but if we want to display only `VMs` and know which `pool` contains these `VMs`, how would it be possible ? 
```
├── VM
│   ├── VBD
│   ├── VIF
│   └── network
└── VM_snapshot
```

**Possible solution**: Always display complete tree view.

- **Search inside of the tree** : When using a search bar, it's difficult to display the result in a tree view format.
  - **Possible solution**: Display flat objects.
- **Render large amount of data** : When rendering a large amount of nodes in a tree view, performance issues appears.
  - **Possible solution**: limit displaying objects.

## What is next ?

- Multiple object selection ( bulk actions ) 